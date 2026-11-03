/**
 * Live Firebase Integration Service for "My Love Razma ❤️"
 * Connects directly to Google Cloud Firestore, Firebase Authentication, and Firebase Storage.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  getDocFromServer,
} from 'firebase/firestore';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

export const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const firebaseAuth = getAuth(firebaseApp);
export const firestoreDb = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
export const firebaseStorage = getStorage(firebaseApp);

// Configure local browser persistence
if (typeof window !== 'undefined') {
  setPersistence(firebaseAuth, browserLocalPersistence).catch(() => {});
}

export const isFirebaseConfigured = (): boolean => true;

// Live Connection Validation
export async function testLiveFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(firestoreDb, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline, using reactive local cache.');
      return false;
    }
    // Any other response means we communicated with server (e.g. not found or permission check)
    return true;
  }
}

// Helper to compress image Blob before upload
async function compressImageBlob(blob: Blob, maxDim = 1280, quality = 0.82): Promise<Blob> {
  if (!blob.type.startsWith('image/') || blob.type.includes('svg') || blob.type.includes('gif')) {
    return blob;
  }
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (compressed) => resolve(compressed || blob),
          'image/jpeg',
          quality
        );
      } else {
        resolve(blob);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(blob);
    };
    img.src = url;
  });
}

// Upload Media Helper (Photos, Videos, Audio) to Firebase Storage
export async function uploadMediaToStorage(file: Blob, folder: string, fileName?: string): Promise<string> {
  const name = fileName || `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `${folder}/${name}`;

  let preparedFile = file;
  if (file.type.startsWith('image/')) {
    try {
      preparedFile = await compressImageBlob(file);
    } catch {
      preparedFile = file;
    }
  }

  try {
    const fileRef = storageRef(firebaseStorage, path);
    const snapshot = await uploadBytes(fileRef, preparedFile);
    return await getDownloadURL(snapshot.ref);
  } catch (err) {
    console.warn(`Storage upload to ${path} failed or offline:`, err);
    // If upload to Firebase Storage failed, create a lightweight compressed preview URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(preparedFile);
    });
  }
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: firebaseAuth.currentUser?.uid,
      email: firebaseAuth.currentUser?.email,
    },
    operationType,
    path,
  };
  console.warn('Firestore Operation Notification:', JSON.stringify(errInfo));
  return errInfo;
}

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
};
export type { User };
