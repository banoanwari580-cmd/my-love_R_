/**
 * Core Reactive Database & Storage Service for "My Love Razma ❤️"
 * Facebook-style Romantic Social Network for Two.
 * Connects directly to Google Cloud Firestore, Firebase Storage, and Auth.
 */

import {
  UserProfile,
  UserRole,
  RelationshipInfo,
  Post,
  PostComment,
  PostReaction,
  ReactionType,
  LoveMessage,
  Story,
  Memory,
  LoveLetter,
  Stage,
  GameScore,
  RewardBadge,
} from '../types';
import {
  DEFAULT_USERS,
  INITIAL_STAGES,
  INITIAL_BADGES,
} from '../data/initialData';
import { sound } from './sound';
import {
  firebaseAuth,
  firestoreDb,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  handleFirestoreError,
  OperationType,
  User,
  testLiveFirestoreConnection,
} from './firebase';

const STORAGE_KEYS = {
  AUTH_TOKEN: 'love_auth_active',
  CURRENT_ROLE: 'love_current_role',
  USERS: 'love_users_data',
  RELATIONSHIP: 'love_relationship_info',
  POSTS: 'love_feed_posts',
  MESSAGES: 'love_chat_messages',
  STORIES: 'love_stories_list',
  MEMORIES: 'love_memories_gallery',
  LETTERS: 'love_letters_vault',
  STAGES: 'love_stages_progress',
  SCORES: 'love_game_scores',
  BADGES: 'love_reward_badges',
};

type StoreListener = () => void;

/**
 * Strips any heavy Base64 (data:...) payloads from items before saving to localStorage.
 * Cloud Firestore and in-memory state retain full URLs/content.
 * This ensures the browser's 5MB localStorage quota is never exceeded.
 */
function cleanMediaForLocalCache<T>(items: T[], maxItems = 15): T[] {
  if (!Array.isArray(items)) return [];
  return items.slice(0, maxItems).map((item: any) => {
    if (!item || typeof item !== 'object') return item;
    const copy = { ...item };
    if (copy.mediaUrl && typeof copy.mediaUrl === 'string' && copy.mediaUrl.startsWith('data:')) {
      copy.mediaUrl = '';
    }
    if (copy.imageUrl && typeof copy.imageUrl === 'string' && copy.imageUrl.startsWith('data:')) {
      copy.imageUrl = '';
    }
    if (copy.audioUrl && typeof copy.audioUrl === 'string' && copy.audioUrl.startsWith('data:')) {
      copy.audioUrl = '';
    }
    if (copy.authorAvatar && typeof copy.authorAvatar === 'string' && copy.authorAvatar.startsWith('data:')) {
      copy.authorAvatar = '';
    }
    if (copy.avatar && typeof copy.avatar === 'string' && copy.avatar.startsWith('data:')) {
      copy.avatar = '';
    }
    return copy;
  });
}

class LoveStore {
  private currentRole: UserRole = 'admin';
  private isAuthenticated: boolean = false;
  private isOnline: boolean = navigator.onLine;
  private isFirebaseLive: boolean = false;
  private users: { admin: UserProfile; razma: UserProfile } = DEFAULT_USERS;
  private relationship: RelationshipInfo = {
    startDate: '2023-09-21T00:00:00.000Z',
    title: 'روزهای بهشتی عشق ما',
    songName: 'نغمه عشق بی‌پایان',
  };
  private posts: Post[] = [];
  private messages: LoveMessage[] = [];
  private stories: Story[] = [];
  private memories: Memory[] = [];
  private letters: LoveLetter[] = [];
  private stages: Stage[] = INITIAL_STAGES;
  private scores: GameScore[] = [];
  private badges: RewardBadge[] = INITIAL_BADGES;
  private listeners: Set<StoreListener> = new Set();
  private unsubs: (() => void)[] = [];
  private isSyncActive: boolean = false;
  private saveDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.loadFromStorage();
    this.initAuthListener();
    this.initNetworkListeners();
    this.checkCloudConnection();

    // Run cleanup of expired 12-hour stories periodically
    setInterval(() => this.cleanupExpiredStories(), 60000);
  }

  private initNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.checkCloudConnection();
      if (this.isAuthenticated) {
        this.startFirestoreSync(); // Safe reconnection
      }
      this.notify();
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.isFirebaseLive = false;
      this.notify();
    });
    window.addEventListener('beforeunload', () => {
      if (this.saveDebounceTimer) {
        clearTimeout(this.saveDebounceTimer);
        this.saveToStorage();
      }
    });
  }

  public async checkCloudConnection(): Promise<boolean> {
    const live = await testLiveFirestoreConnection();
    this.isFirebaseLive = live;
    this.notify();
    return live;
  }

  public getConnectionStatus() {
    return {
      isOnline: this.isOnline,
      isFirebaseLive: this.isFirebaseLive,
    };
  }

  private initAuthListener() {
    onAuthStateChanged(firebaseAuth, (user: User | null) => {
      if (user) {
        const email = user.email?.toLowerCase().trim() || '';
        let role: UserRole | null = null;

        if (
          email === 'hamid@gmail.com' ||
          email === this.users.admin.email.toLowerCase().trim() ||
          email.includes('hamid') ||
          email.includes('admin') ||
          email === 'banoanwari580@gmail.com' ||
          user.uid === 'admin_uid'
        ) {
          role = 'admin';
        } else if (
          email === 'razma@gmail.com' ||
          email === this.users.razma.email.toLowerCase().trim() ||
          email.includes('razma') ||
          user.uid === 'razma_uid'
        ) {
          role = 'razma';
        }

        if (role) {
          this.currentRole = role;
          this.isAuthenticated = true;
          this.users[role].isOnline = true;
          localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'true');
          localStorage.setItem(STORAGE_KEYS.CURRENT_ROLE, role);
          this.startFirestoreSync();
        } else {
          signOut(firebaseAuth).catch(() => {});
          this.isAuthenticated = false;
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        }
      } else {
        const savedAuth = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (savedAuth === 'true') {
          this.isAuthenticated = true;
        }
      }
      this.notify();
    });
  }

  public stopFirestoreSync() {
    this.unsubs.forEach((u) => {
      try {
        u();
      } catch {
        // Ignore
      }
    });
    this.unsubs = [];
    this.isSyncActive = false;
  }

  public startFirestoreSync() {
    if (!this.isAuthenticated) return;

    // Clear old listeners safely to prevent duplicate subscriptions
    this.stopFirestoreSync();
    this.isSyncActive = true;

    try {
      // 1. Live Sync Posts
      const postsQuery = query(collection(firestoreDb, 'posts'), orderBy('createdAt', 'desc'), limit(100));
      const unsubPosts = onSnapshot(postsQuery, (snapshot) => {
        const remotePosts: Post[] = [];
        snapshot.forEach((docSnap) => {
          remotePosts.push({ ...docSnap.data(), id: docSnap.id } as Post);
        });
        if (remotePosts.length > 0) {
          this.posts = remotePosts;
          this.notify();
        }
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'posts'));
      this.unsubs.push(unsubPosts);

      // 2. Live Sync Messages
      const msgQuery = query(collection(firestoreDb, 'messages'), orderBy('createdAt', 'asc'), limit(150));
      const unsubMsgs = onSnapshot(msgQuery, (snapshot) => {
        const remoteMsgs: LoveMessage[] = [];
        snapshot.forEach((docSnap) => {
          remoteMsgs.push({ ...docSnap.data(), id: docSnap.id } as LoveMessage);
        });
        if (remoteMsgs.length > 0) {
          this.messages = remoteMsgs;
          this.notify();
        }
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'messages'));
      this.unsubs.push(unsubMsgs);

      // 3. Live Sync Stories
      const storiesQuery = query(collection(firestoreDb, 'stories'), orderBy('createdAt', 'desc'), limit(50));
      const unsubStories = onSnapshot(storiesQuery, (snapshot) => {
        const remoteStories: Story[] = [];
        snapshot.forEach((docSnap) => {
          remoteStories.push({ ...docSnap.data(), id: docSnap.id } as Story);
        });
        if (remoteStories.length > 0) {
          this.stories = remoteStories;
          this.notify();
        }
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'stories'));
      this.unsubs.push(unsubStories);

      // 4. Live Sync Memories
      const memQuery = query(collection(firestoreDb, 'memories'), orderBy('createdAt', 'desc'), limit(100));
      const unsubMemories = onSnapshot(memQuery, (snapshot) => {
        const remoteMems: Memory[] = [];
        snapshot.forEach((docSnap) => {
          remoteMems.push({ ...docSnap.data(), id: docSnap.id } as Memory);
        });
        if (remoteMems.length > 0) {
          this.memories = remoteMems;
          this.notify();
        }
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'memories'));
      this.unsubs.push(unsubMemories);

      // 5. Live Sync Letters
      const letQuery = query(collection(firestoreDb, 'loveLetters'), orderBy('createdAt', 'desc'), limit(100));
      const unsubLetters = onSnapshot(letQuery, (snapshot) => {
        const remoteLetters: LoveLetter[] = [];
        snapshot.forEach((docSnap) => {
          remoteLetters.push({ ...docSnap.data(), id: docSnap.id } as LoveLetter);
        });
        if (remoteLetters.length > 0) {
          this.letters = remoteLetters;
          this.notify();
        }
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'loveLetters'));
      this.unsubs.push(unsubLetters);

      // 6. Live Sync Users
      const unsubUsers = onSnapshot(collection(firestoreDb, 'users'), (snapshot) => {
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as UserProfile;
          if (docSnap.id === 'admin') this.users.admin = data;
          if (docSnap.id === 'razma') this.users.razma = data;
        });
        this.notify();
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'users'));
      this.unsubs.push(unsubUsers);

    } catch (e) {
      console.warn('Firestore live listener setup note:', e);
    }
  }

  private safeSetItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (err: unknown) {
      const isQuota =
        err instanceof DOMException &&
        (err.name === 'QuotaExceededError' ||
          err.code === 22 ||
          err.code === 1014 ||
          err.name === 'NS_ERROR_DOM_QUOTA_REACHED');

      if (isQuota) {
        console.warn(`[LoveStore] LocalStorage quota limit reached for key '${key}'. Pruning cache to protect storage.`);
        try {
          // Remove oversized item from localStorage to free memory
          localStorage.removeItem(key);
        } catch {
          // Ignore
        }
      } else {
        console.warn(`[LoveStore] Could not write key '${key}' to localStorage:`, err);
      }
    }
  }

  private loadFromStorage() {
    try {
      // Purge any legacy oversized items from previous sessions that caused QuotaExceededError
      for (const key of Object.values(STORAGE_KEYS)) {
        try {
          const raw = localStorage.getItem(key);
          if (raw && (raw.includes('data:image/') || raw.includes('data:video/') || raw.length > 80000)) {
            console.warn(`[LoveStore] Purging legacy oversized cached item: ${key}`);
            localStorage.removeItem(key);
          }
        } catch {
          // Ignore
        }
      }

      const savedAuth = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (savedAuth === 'true') {
        this.isAuthenticated = true;
      }

      const savedRole = localStorage.getItem(STORAGE_KEYS.CURRENT_ROLE);
      if (savedRole === 'admin' || savedRole === 'razma') {
        this.currentRole = savedRole;
      }

      const savedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      if (savedUsers) {
        this.users = JSON.parse(savedUsers);
      }

      const savedRel = localStorage.getItem(STORAGE_KEYS.RELATIONSHIP);
      if (savedRel) {
        this.relationship = JSON.parse(savedRel);
      }

      const savedPosts = localStorage.getItem(STORAGE_KEYS.POSTS);
      if (savedPosts) {
        this.posts = JSON.parse(savedPosts);
      } else {
        // Initial couple posts
        this.posts = [
          {
            id: 'post-1',
            authorId: 'razma',
            authorName: 'رزما من ❤️',
            authorAvatar: this.users.razma.avatar,
            content: 'هر روزی که در کنار تو بیدار می‌شوم، شکرگزار پروردگارم بابت داشتن زیباترین فرشته دنیا... عشق ما تا ابدیت جاری است! 🌹✨💍',
            mediaUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=1000&auto=format&fit=crop&q=80',
            mediaType: 'image',
            createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
            reactions: [
              { userId: 'admin', userName: this.users.admin.name, type: 'love', createdAt: new Date().toISOString() },
              { userId: 'admin', userName: this.users.admin.name, type: 'eternity', createdAt: new Date().toISOString() },
            ],
            comments: [
              {
                id: 'c-1',
                authorId: 'admin',
                authorName: this.users.admin.name,
                authorAvatar: this.users.admin.avatar,
                text: 'فدای نگاه مهربانت شوم نفسم، دنیای من با خنده‌های تو پر از نور است ❤️',
                createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
              },
            ],
          },
          {
            id: 'post-2',
            authorId: 'admin',
            authorName: 'حمید (مدیر برنامه)',
            authorAvatar: this.users.admin.avatar,
            content: 'تقدیم به ملکه رویاهایم رزما: «تو مرا جان و جهانی، چه کنم جان و جهان را؟» خوشحالم که قصر اختصاصی شبکه‌ای خودمان را افتتاح کردیم! 🥂👑',
            mediaUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=1000&auto=format&fit=crop&q=80',
            mediaType: 'image',
            createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
            reactions: [
              { userId: 'razma', userName: 'رزما من ❤️', type: 'love', createdAt: new Date().toISOString() },
              { userId: 'razma', userName: 'رزما من ❤️', type: 'adore', createdAt: new Date().toISOString() },
            ],
            comments: [],
          },
        ];
      }

      const savedMsgs = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      if (savedMsgs) {
        this.messages = JSON.parse(savedMsgs);
      } else {
        this.messages = [
          {
            id: 'm-1',
            senderId: 'admin',
            receiverId: 'razma',
            text: 'سلام زیباترین معجزه زندگی من، رزما جانم ❤️ خوش اومدی به قصر اختصاصی خودمون!',
            createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
            readAt: new Date(Date.now() - 3600000 * 4).toISOString(),
            reaction: '❤️',
          },
        ];
      }

      const savedStories = localStorage.getItem(STORAGE_KEYS.STORIES);
      if (savedStories) {
        this.stories = JSON.parse(savedStories);
      }

      const savedMemories = localStorage.getItem(STORAGE_KEYS.MEMORIES);
      if (savedMemories) {
        this.memories = JSON.parse(savedMemories);
      }

      const savedLetters = localStorage.getItem(STORAGE_KEYS.LETTERS);
      if (savedLetters) {
        this.letters = JSON.parse(savedLetters);
      }

      const savedStages = localStorage.getItem(STORAGE_KEYS.STAGES);
      if (savedStages) {
        this.stages = JSON.parse(savedStages);
      }

      const savedScores = localStorage.getItem(STORAGE_KEYS.SCORES);
      if (savedScores) {
        this.scores = JSON.parse(savedScores);
      }

      const savedBadges = localStorage.getItem(STORAGE_KEYS.BADGES);
      if (savedBadges) {
        this.badges = JSON.parse(savedBadges);
      }
    } catch (e) {
      console.error('Error loading store from storage:', e);
    }
  }

  private saveToStorage() {
    this.safeSetItem(STORAGE_KEYS.AUTH_TOKEN, this.isAuthenticated ? 'true' : 'false');
    this.safeSetItem(STORAGE_KEYS.CURRENT_ROLE, this.currentRole);
    this.safeSetItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
    this.safeSetItem(STORAGE_KEYS.RELATIONSHIP, JSON.stringify(this.relationship));
    this.safeSetItem(STORAGE_KEYS.POSTS, JSON.stringify(cleanMediaForLocalCache(this.posts, 15)));
    this.safeSetItem(STORAGE_KEYS.MESSAGES, JSON.stringify(cleanMediaForLocalCache(this.messages, 25)));
    this.safeSetItem(STORAGE_KEYS.STORIES, JSON.stringify(cleanMediaForLocalCache(this.stories, 15)));
    this.safeSetItem(STORAGE_KEYS.MEMORIES, JSON.stringify(cleanMediaForLocalCache(this.memories, 15)));
    this.safeSetItem(STORAGE_KEYS.LETTERS, JSON.stringify(cleanMediaForLocalCache(this.letters, 15)));
    this.safeSetItem(STORAGE_KEYS.STAGES, JSON.stringify(this.stages));
    this.safeSetItem(STORAGE_KEYS.SCORES, JSON.stringify(this.scores));
    this.safeSetItem(STORAGE_KEYS.BADGES, JSON.stringify(this.badges));
  }

  public subscribe(listener: StoreListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    // 1. Immediately notify React subscribers for reactive UI
    this.listeners.forEach((fn) => fn());

    // 2. Debounce local storage write to prevent repeated oversized writes
    if (this.saveDebounceTimer) {
      clearTimeout(this.saveDebounceTimer);
    }
    this.saveDebounceTimer = setTimeout(() => {
      this.saveToStorage();
    }, 200);
  }

  // --- Auth & Session ---
  public getIsAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  public async loginWithEmail(email: string, pass: string): Promise<{ success: boolean; error?: string }> {
    const cleanEmail = email.toLowerCase().trim();
    const cleanPass = pass.trim();

    let targetRole: UserRole | null = null;
    if (
      cleanEmail === 'hamid@gmail.com' ||
      cleanEmail === this.users.admin.email.toLowerCase().trim() ||
      cleanEmail.includes('hamid') ||
      cleanEmail.includes('admin') ||
      cleanEmail === 'banoanwari580@gmail.com'
    ) {
      targetRole = 'admin';
    } else if (
      cleanEmail === 'razma@gmail.com' ||
      cleanEmail === this.users.razma.email.toLowerCase().trim() ||
      cleanEmail.includes('razma')
    ) {
      targetRole = 'razma';
    } else {
      return {
        success: false,
        error: 'دسترسی غیرمجاز: این اپلیکیشن منحصراً متعلق به دو نفر (حمید و رزما) است و ورود هر حساب دیگر مسدود است.',
      };
    }

    // Attempt authenticating with Firebase Auth (SignIn or CreateUser)
    let firebaseSuccess = false;
    try {
      await signInWithEmailAndPassword(firebaseAuth, cleanEmail, cleanPass);
      firebaseSuccess = true;
    } catch (signInErr: any) {
      const code = signInErr?.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
        try {
          await createUserWithEmailAndPassword(firebaseAuth, cleanEmail, cleanPass);
          firebaseSuccess = true;
        } catch (createErr) {
          console.warn('Firebase createUser notice:', createErr);
        }
      }
    }

    // Passcode validation: configured passcode 'afghan' or successful Firebase login
    const isPasscodeValid = cleanPass === 'afghan' || firebaseSuccess;
    if (!isPasscodeValid) {
      return {
        success: false,
        error: 'کد ورود نادرست است. لطفاً رمز عبور صحیح را وارد کنید.',
      };
    }

    this.currentRole = targetRole;
    this.isAuthenticated = true;
    this.users[targetRole].email = cleanEmail;
    this.users[targetRole].isOnline = true;
    this.users[targetRole].lastActive = new Date().toISOString();

    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'true');
    localStorage.setItem(STORAGE_KEYS.CURRENT_ROLE, targetRole);

    // Save/Sync user profile to Firestore database
    try {
      await setDoc(doc(firestoreDb, 'users', targetRole), {
        ...this.users[targetRole],
        email: cleanEmail,
        isOnline: true,
        lastActive: new Date().toISOString(),
      }, { merge: true });
    } catch (fsErr) {
      console.warn('Firestore user doc sync notice:', fsErr);
    }

    this.startFirestoreSync();
    sound.playVictoryFanfare();
    this.notify();
    return { success: true };
  }

  public async sendResetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      await sendPasswordResetEmail(firebaseAuth, email.trim());
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  public async logout() {
    try {
      await signOut(firebaseAuth);
    } catch {
      // Ignored
    }
    this.isAuthenticated = false;
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    this.stopFirestoreSync();
    this.notify();
  }

  public getCurrentRole(): UserRole {
    return this.currentRole;
  }

  public getCurrentUser(): UserProfile {
    return this.users[this.currentRole];
  }

  public getPartnerRole(): UserRole {
    return this.currentRole === 'admin' ? 'razma' : 'admin';
  }

  public getPartnerUser(): UserProfile {
    return this.users[this.getPartnerRole()];
  }

  public updateProfile(role: UserRole, updates: Partial<UserProfile>) {
    this.users[role] = { ...this.users[role], ...updates };
    setDoc(doc(firestoreDb, 'users', role), this.users[role], { merge: true }).catch((err) =>
      handleFirestoreError(err, OperationType.UPDATE, `users/${role}`)
    );
    this.notify();
  }

  public updateRelationship(updates: Partial<RelationshipInfo>) {
    this.relationship = { ...this.relationship, ...updates };
    setDoc(doc(firestoreDb, 'settings', 'relationship'), this.relationship, { merge: true }).catch((err) =>
      handleFirestoreError(err, OperationType.UPDATE, 'settings/relationship')
    );
    this.notify();
  }

  public getRelationship(): RelationshipInfo {
    return this.relationship;
  }

  // --- Facebook Feed Posts ---
  public getPosts(): Post[] {
    return [...this.posts];
  }

  public async createPost(content: string, mediaUrl?: string, mediaType: 'image' | 'video' = 'image') {
    const author = this.getCurrentUser();
    const postId = `post-${Date.now()}`;
    const newPost: Post = {
      id: postId,
      authorId: this.currentRole,
      authorName: author.name,
      authorAvatar: author.avatar,
      content,
      mediaUrl,
      mediaType,
      createdAt: new Date().toISOString(),
      reactions: [],
      comments: [],
    };

    this.posts.unshift(newPost);
    sound.playChime();

    // Reward heart points for romantic activity
    this.users[this.currentRole].heartScore += 15;

    setDoc(doc(firestoreDb, 'posts', postId), newPost).catch((err) =>
      handleFirestoreError(err, OperationType.CREATE, `posts/${postId}`)
    );

    this.notify();
  }

  public async updatePost(postId: string, content: string) {
    const post = this.posts.find((p) => p.id === postId);
    if (!post || post.authorId !== this.currentRole) return;

    post.content = content;
    post.updatedAt = new Date().toISOString();

    updateDoc(doc(firestoreDb, 'posts', postId), {
      content,
      updatedAt: post.updatedAt,
    }).catch(() => {});

    sound.playTileClick();
    this.notify();
  }

  public async deletePost(postId: string) {
    const post = this.posts.find((p) => p.id === postId);
    if (!post || post.authorId !== this.currentRole) return;

    this.posts = this.posts.filter((p) => p.id !== postId);
    deleteDoc(doc(firestoreDb, 'posts', postId)).catch(() => {});
    sound.playTileClick();
    this.notify();
  }

  public async addReactionToPost(postId: string, type: ReactionType) {
    const post = this.posts.find((p) => p.id === postId);
    if (!post) return;

    const currentRole = this.currentRole;
    const author = this.getCurrentUser();

    // Toggle or update reaction
    const existingIdx = post.reactions.findIndex((r) => r.userId === currentRole && r.type === type);
    if (existingIdx > -1) {
      post.reactions.splice(existingIdx, 1);
    } else {
      // Replace previous reaction of same user or append
      post.reactions = post.reactions.filter((r) => r.userId !== currentRole);
      post.reactions.push({
        userId: currentRole,
        userName: author.name,
        type,
        createdAt: new Date().toISOString(),
      });
      sound.playHeartPop();
    }

    updateDoc(doc(firestoreDb, 'posts', postId), {
      reactions: post.reactions,
    }).catch(() => {});

    this.notify();
  }

  public async addCommentToPost(postId: string, text: string, replyToId?: string) {
    const post = this.posts.find((p) => p.id === postId);
    if (!post || !text.trim()) return;

    const author = this.getCurrentUser();
    const newComment: PostComment = {
      id: `comm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      authorId: this.currentRole,
      authorName: author.name,
      authorAvatar: author.avatar,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      replyToId,
    };

    post.comments.push(newComment);
    sound.playChime();

    updateDoc(doc(firestoreDb, 'posts', postId), {
      comments: post.comments,
    }).catch(() => {});

    this.notify();
  }

  public async deleteCommentFromPost(postId: string, commentId: string) {
    const post = this.posts.find((p) => p.id === postId);
    if (!post) return;

    post.comments = post.comments.filter((c) => c.id !== commentId);
    updateDoc(doc(firestoreDb, 'posts', postId), {
      comments: post.comments,
    }).catch(() => {});

    sound.playTileClick();
    this.notify();
  }

  public async updateCommentInPost(postId: string, commentId: string, newText: string) {
    const post = this.posts.find((p) => p.id === postId);
    if (!post || !newText.trim()) return;

    const comm = post.comments.find((c) => c.id === commentId);
    if (!comm || comm.authorId !== this.currentRole) return;

    comm.text = newText.trim();
    updateDoc(doc(firestoreDb, 'posts', postId), {
      comments: post.comments,
    }).catch(() => {});

    sound.playTileClick();
    this.notify();
  }

  // --- Real Messages & Chat ---
  public getMessages(): LoveMessage[] {
    return [...this.messages];
  }

  public sendMessage(text: string, imageUrl?: string, audioUrl?: string, audioDuration?: number) {
    const msgId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newMsg: LoveMessage = {
      id: msgId,
      senderId: this.currentRole,
      receiverId: this.getPartnerRole(),
      text,
      imageUrl,
      audioUrl,
      audioDuration,
      createdAt: new Date().toISOString(),
    };
    this.messages.push(newMsg);

    setDoc(doc(firestoreDb, 'messages', msgId), newMsg).catch((err) =>
      handleFirestoreError(err, OperationType.CREATE, `messages/${msgId}`)
    );

    sound.playChime();
    this.notify();
  }

  public markMessagesAsRead() {
    const current = this.currentRole;
    let updated = false;
    this.messages.forEach((m) => {
      if (m.receiverId === current && !m.readAt) {
        m.readAt = new Date().toISOString();
        updated = true;
        updateDoc(doc(firestoreDb, 'messages', m.id), { readAt: m.readAt }).catch(() => {});
      }
    });
    if (updated) {
      this.notify();
    }
  }

  public reactToMessage(messageId: string, emoji: string) {
    const msg = this.messages.find((m) => m.id === messageId);
    if (msg) {
      msg.reaction = emoji;
      updateDoc(doc(firestoreDb, 'messages', messageId), { reaction: emoji }).catch(() => {});
      sound.playHeartPop();
      this.notify();
    }
  }

  public updateMessage(messageId: string, newText: string) {
    const msg = this.messages.find((m) => m.id === messageId);
    if (!msg || msg.senderId !== this.currentRole || !newText.trim()) return;

    msg.text = newText.trim();
    updateDoc(doc(firestoreDb, 'messages', messageId), { text: msg.text }).catch(() => {});
    sound.playTileClick();
    this.notify();
  }

  public deleteMessage(messageId: string) {
    this.messages = this.messages.filter((m) => m.id !== messageId);
    deleteDoc(doc(firestoreDb, 'messages', messageId)).catch(() => {});
    sound.playTileClick();
    this.notify();
  }

  // --- 12-Hour Stories with Video & Expiration ---
  public getActiveStories(): Story[] {
    const now = new Date().getTime();
    return this.stories.filter((s) => new Date(s.expiresAt).getTime() > now);
  }

  public addStory(mediaUrl: string, mediaType: 'image' | 'video' = 'image', caption?: string) {
    const now = new Date();
    const expires = new Date(now.getTime() + 12 * 60 * 60 * 1000);
    const author = this.getCurrentUser();
    const storyId = `story-${Date.now()}`;

    const story: Story = {
      id: storyId,
      authorId: this.currentRole,
      authorName: author.name,
      authorAvatar: author.avatar,
      mediaUrl,
      mediaType,
      caption,
      createdAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      heartsCount: 0,
      likedBy: [],
      viewers: [],
    };

    this.stories.unshift(story);

    setDoc(doc(firestoreDb, 'stories', storyId), story).catch((err) =>
      handleFirestoreError(err, OperationType.CREATE, `stories/${storyId}`)
    );

    sound.playChime();
    this.notify();
  }

  public recordStoryView(storyId: string) {
    const story = this.stories.find((s) => s.id === storyId);
    if (!story) return;

    const currentRole = this.currentRole;
    const existing = story.viewers.find((v) => v.userId === currentRole);
    if (!existing) {
      const newViewer = {
        userId: currentRole,
        userName: this.getCurrentUser().name,
        viewedAt: new Date().toISOString(),
      };
      story.viewers.push(newViewer);

      updateDoc(doc(firestoreDb, 'stories', storyId), { viewers: story.viewers }).catch(() => {});
      this.notify();
    }
  }

  public heartStory(storyId: string) {
    const story = this.stories.find((s) => s.id === storyId);
    if (!story) return;

    const currentRole = this.currentRole;
    if (!story.likedBy.includes(currentRole)) {
      story.likedBy.push(currentRole);
      story.heartsCount += 1;

      updateDoc(doc(firestoreDb, 'stories', storyId), {
        likedBy: story.likedBy,
        heartsCount: story.heartsCount,
      }).catch(() => {});

      sound.playHeartPop();
      this.notify();
    }
  }

  public deleteStory(storyId: string) {
    const story = this.stories.find((s) => s.id === storyId);
    if (!story || story.authorId !== this.currentRole) return;

    this.stories = this.stories.filter((s) => s.id !== storyId);
    deleteDoc(doc(firestoreDb, 'stories', storyId)).catch(() => {});
    sound.playTileClick();
    this.notify();
  }

  public updateStory(storyId: string, caption: string) {
    const story = this.stories.find((s) => s.id === storyId);
    if (!story || story.authorId !== this.currentRole) return;

    story.caption = caption.trim() || undefined;
    updateDoc(doc(firestoreDb, 'stories', storyId), {
      caption: story.caption,
    }).catch(() => {});

    sound.playTileClick();
    this.notify();
  }

  public cleanupExpiredStories() {
    const now = new Date().getTime();
    const initialLen = this.stories.length;
    const expiredList = this.stories.filter((s) => new Date(s.expiresAt).getTime() <= now);
    this.stories = this.stories.filter((s) => new Date(s.expiresAt).getTime() > now);

    expiredList.forEach((exp) => {
      deleteDoc(doc(firestoreDb, 'stories', exp.id)).catch(() => {});
    });

    if (this.stories.length !== initialLen) {
      this.notify();
    }
  }

  // --- Memories Gallery ---
  public getMemories(): Memory[] {
    return [...this.memories];
  }

  public addMemory(memory: Omit<Memory, 'id' | 'createdAt' | 'authorId'>) {
    const memId = `mem-${Date.now()}`;
    const newMem: Memory = {
      ...memory,
      id: memId,
      authorId: this.currentRole,
      createdAt: new Date().toISOString(),
    };
    this.memories.unshift(newMem);

    setDoc(doc(firestoreDb, 'memories', memId), newMem).catch((err) =>
      handleFirestoreError(err, OperationType.CREATE, `memories/${memId}`)
    );

    sound.playChime();
    this.notify();
  }

  public updateMemory(id: string, updates: Partial<Memory>) {
    const mem = this.memories.find((m) => m.id === id);
    if (!mem) return;

    Object.assign(mem, updates);
    updateDoc(doc(firestoreDb, 'memories', id), updates).catch(() => {});
    sound.playTileClick();
    this.notify();
  }

  public deleteMemory(id: string) {
    this.memories = this.memories.filter((m) => m.id !== id);
    deleteDoc(doc(firestoreDb, 'memories', id)).catch(() => {});
    sound.playTileClick();
    this.notify();
  }

  // --- Love Letters ---
  public getLetters(): LoveLetter[] {
    return [...this.letters];
  }

  public sendLetter(title: string, content: string, paperTheme: LoveLetter['paperTheme']) {
    const sender = this.getCurrentUser();
    const letId = `let-${Date.now()}`;
    const newLetter: LoveLetter = {
      id: letId,
      senderId: this.currentRole,
      senderName: sender.name,
      receiverId: this.getPartnerRole(),
      title,
      content,
      paperTheme,
      isSealed: true,
      createdAt: new Date().toISOString(),
    };
    this.letters.unshift(newLetter);

    setDoc(doc(firestoreDb, 'loveLetters', letId), newLetter).catch((err) =>
      handleFirestoreError(err, OperationType.CREATE, `loveLetters/${letId}`)
    );

    sound.playChime();
    this.notify();
  }

  public updateLetter(id: string, title: string, content: string, paperTheme?: LoveLetter['paperTheme']) {
    const letter = this.letters.find((l) => l.id === id);
    if (!letter || letter.senderId !== this.currentRole) return;

    letter.title = title.trim();
    letter.content = content.trim();
    if (paperTheme) letter.paperTheme = paperTheme;

    updateDoc(doc(firestoreDb, 'loveLetters', id), {
      title: letter.title,
      content: letter.content,
      paperTheme: letter.paperTheme,
    }).catch(() => {});

    sound.playTileClick();
    this.notify();
  }

  public deleteLetter(id: string) {
    this.letters = this.letters.filter((l) => l.id !== id);
    deleteDoc(doc(firestoreDb, 'loveLetters', id)).catch(() => {});
    sound.playTileClick();
    this.notify();
  }

  public unsealLetter(id: string) {
    const letter = this.letters.find((l) => l.id === id);
    if (letter && letter.isSealed) {
      letter.isSealed = false;
      letter.openedAt = new Date().toISOString();

      updateDoc(doc(firestoreDb, 'loveLetters', id), {
        isSealed: false,
        openedAt: letter.openedAt,
      }).catch(() => {});

      sound.playVictoryFanfare();
      this.notify();
    }
  }

  // --- 30 Stages Progression ---
  public getStages(): Stage[] {
    return [...this.stages];
  }

  public updateStageNotes(stageId: number, partnerNotes: string) {
    const stage = this.stages.find((s) => s.id === stageId);
    if (!stage) return;

    stage.partnerNotes = partnerNotes.trim() || undefined;
    updateDoc(doc(firestoreDb, 'stages', String(stageId)), {
      partnerNotes: stage.partnerNotes || null,
    }).catch(() => {});

    sound.playTileClick();
    this.notify();
  }

  public deleteStageNotes(stageId: number) {
    const stage = this.stages.find((s) => s.id === stageId);
    if (!stage) return;

    delete stage.partnerNotes;
    updateDoc(doc(firestoreDb, 'stages', String(stageId)), {
      partnerNotes: null,
    }).catch(() => {});

    sound.playTileClick();
    this.notify();
  }

  public completeStage(stageId: number, partnerNotes?: string) {
    const stage = this.stages.find((s) => s.id === stageId);
    if (!stage) return;

    stage.isCompleted = true;
    stage.completedAt = new Date().toLocaleDateString('fa-IR');
    if (partnerNotes) {
      stage.partnerNotes = partnerNotes;
    }

    this.users.admin.heartScore += stage.rewardPoints;
    this.users.razma.heartScore += stage.rewardPoints;

    const nextStage = this.stages.find((s) => s.id === stageId + 1);
    if (nextStage) {
      nextStage.isUnlocked = true;
    }

    if (stageId === 5) this.unlockBadge('stage_five');
    if (stageId === 30) this.unlockBadge('stage_thirty');

    setDoc(doc(firestoreDb, 'loveStages', `stage_${stageId}`), stage, { merge: true }).catch(() => {});
    setDoc(doc(firestoreDb, 'users', 'admin'), this.users.admin, { merge: true }).catch(() => {});
    setDoc(doc(firestoreDb, 'users', 'razma'), this.users.razma, { merge: true }).catch(() => {});

    sound.playVictoryFanfare();
    this.notify();
  }

  // --- Games Scores & Badges ---
  public getScores(): GameScore[] {
    return [...this.scores];
  }

  public recordGameScore(gameId: GameScore['gameId'], gameName: string, score: number, details?: string) {
    const scoreId = `score-${Date.now()}`;
    const newScore: GameScore = {
      id: scoreId,
      gameId,
      gameName,
      userId: this.currentRole,
      score,
      details,
      playedAt: new Date().toISOString(),
    };
    this.scores.unshift(newScore);

    const bonus = Math.max(10, Math.floor(score / 5));
    this.users[this.currentRole].heartScore += bonus;

    if (gameId === 'quiz' && score >= 100) this.unlockBadge('quiz_master');
    if (gameId === 'photo-puzzle' && score >= 50) this.unlockBadge('puzzle_champion');
    if (gameId === 'heart-catcher' && score >= 500) this.unlockBadge('catcher_legend');

    setDoc(doc(firestoreDb, 'games', scoreId), newScore).catch(() => {});
    setDoc(doc(firestoreDb, 'users', this.currentRole), this.users[this.currentRole], { merge: true }).catch(() => {});

    sound.playVictoryFanfare();
    this.notify();
  }

  public getBadges(): RewardBadge[] {
    return [...this.badges];
  }

  public unlockBadge(badgeId: string) {
    const badge = this.badges.find((b) => b.id === badgeId);
    if (badge && !badge.isUnlocked) {
      badge.isUnlocked = true;
      badge.unlockedAt = new Date().toLocaleDateString('fa-IR');
      setDoc(doc(firestoreDb, 'rewards', badgeId), badge, { merge: true }).catch(() => {});
      this.notify();
    }
  }

  public resetAllToDefault() {
    this.users = DEFAULT_USERS;
    this.stages = INITIAL_STAGES;
    this.badges = INITIAL_BADGES;
    this.posts = [];
    this.messages = [];
    this.stories = [];
    this.memories = [];
    this.letters = [];
    this.scores = [];
    this.isAuthenticated = false;
    localStorage.clear();
    this.saveToStorage();
    this.notify();
  }
}

export const store = new LoveStore();
