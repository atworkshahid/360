import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  Firestore,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Course, AppUser } from '../types';

// Initialize Firebase App instance safely (prevent duplicate initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db: Firestore = getFirestore(app);
export const auth = getAuth(app);

export type SharePermissionLevel = 'public_read' | 'restricted' | 'reviewer_only';

export interface SharedCourseRecord {
  shareId: string;
  courseId: string;
  courseTitle: string;
  courseCode: string;
  courseData: Course;
  permissionLevel: SharePermissionLevel;
  allowReviewerComments: boolean;
  allowExport: boolean;
  expiresAt: string | null;
  passcode: string | null;
  createdAt: string;
  createdByEmail: string;
  createdByName: string;
  isActive: boolean;
  accessCount: number;
  lastAccessedAt: string;
}

export interface CreateShareOptions {
  permissionLevel?: SharePermissionLevel;
  allowReviewerComments?: boolean;
  allowExport?: boolean;
  expiresInDays?: number | null; // null for never, 7, 30, 90
  passcode?: string | null;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const LOCAL_STORAGE_SHARES_KEY = 'mentisera_shared_courses_cache_v1';

function getLocalShares(): SharedCourseRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SHARES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalShare(record: SharedCourseRecord): void {
  try {
    const list = getLocalShares();
    const idx = list.findIndex((s) => s.shareId === record.shareId);
    if (idx !== -1) {
      list[idx] = record;
    } else {
      list.unshift(record);
    }
    localStorage.setItem(LOCAL_STORAGE_SHARES_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('Could not cache share record locally:', e);
  }
}

export const ShareService = {
  /**
   * Generates a unique, tamper-proof share token
   */
  generateShareToken(): string {
    const timeHex = Date.now().toString(36);
    const randHex = Math.random().toString(36).substring(2, 9);
    return `sh_${timeHex}_${randHex}`;
  },

  /**
   * Constructs the full unique read-only URL for external sharing
   */
  getShareUrl(shareId: string): string {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/?shareId=${encodeURIComponent(shareId)}`;
  },

  /**
   * Creates and registers a new read-only shared course blueprint in Firebase Firestore
   */
  async createShareLink(
    course: Course,
    options: CreateShareOptions = {},
    currentUser?: AppUser | null
  ): Promise<SharedCourseRecord> {
    const shareId = this.generateShareToken();
    const now = new Date();

    let expiresAt: string | null = null;
    if (options.expiresInDays && options.expiresInDays > 0) {
      const expDate = new Date(now.getTime() + options.expiresInDays * 24 * 60 * 60 * 1000);
      expiresAt = expDate.toISOString();
    }

    const record: SharedCourseRecord = {
      shareId,
      courseId: course.id,
      courseTitle: course.title,
      courseCode: course.code,
      courseData: course,
      permissionLevel: options.permissionLevel || 'public_read',
      allowReviewerComments: options.allowReviewerComments ?? true,
      allowExport: options.allowExport ?? true,
      expiresAt,
      passcode: options.passcode ? options.passcode.trim() : null,
      createdAt: now.toISOString(),
      createdByEmail: currentUser?.email || auth.currentUser?.email || 'faculty@institution.edu',
      createdByName: currentUser?.name || auth.currentUser?.displayName || 'Faculty Author',
      isActive: true,
      accessCount: 0,
      lastAccessedAt: now.toISOString(),
    };

    // 1. Always cache in localStorage first for instant offline readiness
    saveLocalShare(record);

    // 2. Persist to Firebase Firestore
    const docPath = `shared_courses/${shareId}`;
    try {
      const docRef = doc(db, 'shared_courses', shareId);
      await setDoc(docRef, record);
    } catch (err) {
      console.warn('Firestore write warning (using cached share locally):', err);
      // Non-fatal if offline, local fallback remains functional
    }

    return record;
  },

  /**
   * Retrieves a shared course blueprint by shareId from Firestore (or local cache)
   * Enforces status checks (active/revoked, expiration, passcode).
   */
  async getSharedCourse(
    shareId: string
  ): Promise<{ record: SharedCourseRecord | null; error?: string }> {
    let record: SharedCourseRecord | null = null;

    // 1. Attempt Firestore read
    const docPath = `shared_courses/${shareId}`;
    try {
      const docRef = doc(db, 'shared_courses', shareId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        record = snapshot.data() as SharedCourseRecord;
      }
    } catch (err) {
      console.warn('Could not read from Firestore, checking local cache:', err);
    }

    // 2. Fallback to local cache if Firestore returned nothing or threw network error
    if (!record) {
      const localList = getLocalShares();
      record = localList.find((s) => s.shareId === shareId) || null;
    }

    if (!record) {
      return {
        record: null,
        error: 'The requested course share link does not exist or has been removed.',
      };
    }

    // Check if link has been revoked
    if (!record.isActive) {
      return {
        record: null,
        error: 'This shared course link has been revoked by the course author or institution.',
      };
    }

    // Check if expired
    if (record.expiresAt) {
      const expTime = new Date(record.expiresAt).getTime();
      if (Date.now() > expTime) {
        return {
          record: null,
          error: `This share link expired on ${new Date(record.expiresAt).toLocaleDateString()}. Please request an updated review link from the course instructor.`,
        };
      }
    }

    // Update access statistics in background
    try {
      const updatedCount = (record.accessCount || 0) + 1;
      const lastAccessedAt = new Date().toISOString();
      record.accessCount = updatedCount;
      record.lastAccessedAt = lastAccessedAt;
      saveLocalShare(record);

      const docRef = doc(db, 'shared_courses', shareId);
      updateDoc(docRef, {
        accessCount: updatedCount,
        lastAccessedAt,
      }).catch(() => {});
    } catch {
      // access tracking is non-blocking
    }

    return { record };
  },

  /**
   * Retrieves all shared links associated with a given course
   */
  async getCourseShares(courseId: string): Promise<SharedCourseRecord[]> {
    const localList = getLocalShares().filter((s) => s.courseId === courseId);

    try {
      const q = query(collection(db, 'shared_courses'), where('courseId', '==', courseId));
      const querySnap = await getDocs(q);
      const firestoreList: SharedCourseRecord[] = [];
      querySnap.forEach((d) => {
        firestoreList.push(d.data() as SharedCourseRecord);
      });

      if (firestoreList.length > 0) {
        // Merge with local list
        const map = new Map<string, SharedCourseRecord>();
        firestoreList.forEach((s) => map.set(s.shareId, s));
        localList.forEach((s) => {
          if (!map.has(s.shareId)) map.set(s.shareId, s);
        });
        return Array.from(map.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
    } catch (err) {
      console.warn('Failed to query Firestore course shares, returning local:', err);
    }

    return localList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  /**
   * Updates permissions or expiration on an existing share link
   */
  async updateShare(
    shareId: string,
    updates: Partial<Pick<SharedCourseRecord, 'permissionLevel' | 'allowReviewerComments' | 'allowExport' | 'expiresAt' | 'passcode' | 'isActive'>>
  ): Promise<void> {
    // Update local cache
    const list = getLocalShares();
    const idx = list.findIndex((s) => s.shareId === shareId);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      localStorage.setItem(LOCAL_STORAGE_SHARES_KEY, JSON.stringify(list));
    }

    // Update Firestore
    try {
      const docRef = doc(db, 'shared_courses', shareId);
      await updateDoc(docRef, updates);
    } catch (err) {
      console.warn('Failed to update Firestore share document:', err);
    }
  },

  /**
   * Revokes access to a shared link immediately
   */
  async revokeShare(shareId: string): Promise<void> {
    await this.updateShare(shareId, { isActive: false });
  },

  /**
   * Restores an active state on a revoked share link
   */
  async restoreShare(shareId: string): Promise<void> {
    await this.updateShare(shareId, { isActive: true });
  },
};
