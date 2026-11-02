/**
 * Core Type Definitions for "My Love Razma ❤️"
 * Facebook-style Romantic Social Network for Two
 */

export type UserRole = 'admin' | 'razma';

export interface UserProfile {
  id: string; // 'admin' | 'razma'
  name: string;
  role: UserRole;
  avatar: string;
  coverImage?: string;
  email: string;
  bio?: string;
  pin?: string;
  heartScore: number;
  lastActive: string;
  isOnline?: boolean;
}

export interface RelationshipInfo {
  startDate: string; // ISO date string e.g. "2024-03-20T00:00:00.000Z"
  title: string;
  songName?: string;
}

export type ReactionType = 'love' | 'adore' | 'kiss' | 'fire' | 'eternity';

export interface PostReaction {
  userId: UserRole;
  userName: string;
  type: ReactionType;
  createdAt: string;
}

export interface PostComment {
  id: string;
  authorId: UserRole;
  authorName: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
  replyToId?: string;
}

export interface Post {
  id: string;
  authorId: UserRole;
  authorName: string;
  authorAvatar: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  createdAt: string;
  updatedAt?: string;
  reactions: PostReaction[];
  comments: PostComment[];
}

export interface LoveMessage {
  id: string;
  senderId: UserRole;
  receiverId: UserRole;
  text: string;
  imageUrl?: string;
  audioUrl?: string;
  audioDuration?: number;
  createdAt: string;
  readAt?: string;
  reaction?: string;
}

export interface StoryViewer {
  userId: UserRole;
  userName: string;
  viewedAt: string;
}

export interface Story {
  id: string;
  authorId: UserRole;
  authorName: string;
  authorAvatar: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption?: string;
  createdAt: string; // ISO string
  expiresAt: string; // ISO string (12h from createdAt)
  heartsCount: number;
  likedBy: UserRole[];
  viewers: StoryViewer[];
}

export interface Memory {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  location?: string;
  category: 'سفر' | 'اولین دیدار' | 'جشن و کادو' | 'قرارهای عاشقانه' | 'لحظه‌های خاص';
  authorId: UserRole;
  createdAt: string;
}

export interface LoveLetter {
  id: string;
  senderId: UserRole;
  senderName: string;
  receiverId: UserRole;
  title: string;
  content: string;
  paperTheme: 'parchment' | 'rose' | 'night' | 'gold';
  isSealed: boolean;
  openedAt?: string;
  createdAt: string;
}

export interface Stage {
  id: number;
  title: string;
  subtitle: string;
  story: string;
  challenge: string;
  rewardPoints: number;
  badgeName?: string;
  isUnlocked: boolean;
  isCompleted: boolean;
  completedAt?: string;
  partnerNotes?: string;
  imageUrl?: string;
}

export interface GameScore {
  id: string;
  gameId: 'quiz' | 'truth-dare' | 'word-guess' | 'photo-puzzle' | 'couple-questions' | 'heart-catcher';
  gameName: string;
  userId: UserRole;
  score: number;
  details?: string;
  playedAt: string;
}

export interface RewardBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  isUnlocked: boolean;
  category: 'stages' | 'games' | 'letters' | 'days';
}

export interface SongTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration: number;
  cover: string;
}
