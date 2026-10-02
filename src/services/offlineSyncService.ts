import { Course } from '../types';
import { db } from './shareService';
import { doc, setDoc, deleteDoc, getDoc, getDocs, collection } from 'firebase/firestore';

export interface SyncQueueItem {
  id: string;
  courseId: string;
  courseTitle: string;
  action: 'upsert' | 'delete';
  courseData?: Course;
  timestamp: string;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  retryCount: number;
  errorMessage?: string;
}

export interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncedAt: Date | null;
  lastError: string | null;
  swActive: boolean;
  queue: SyncQueueItem[];
}

const DB_NAME = 'OBE360_OFFLINE_DB';
const DB_VERSION = 1;
const STORE_BLUEPRINTS = 'blueprints';
const STORE_QUEUE = 'firebase_sync_queue';

const FALLBACK_BLUEPRINTS_KEY = 'obe360_offline_blueprints_v1';
const FALLBACK_QUEUE_KEY = 'obe360_offline_sync_queue_v1';
const LAST_SYNC_KEY = 'obe360_last_firebase_sync';

class OfflineSyncEngine {
  private dbPromise: Promise<IDBDatabase | null> | null = null;
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private isSyncing: boolean = false;
  private listeners: Set<(state: SyncState) => void> = new Set();
  private lastSyncedAt: Date | null = null;
  private lastError: string | null = null;
  private swActive: boolean = false;
  private syncTimeout: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Read last synced time from localStorage
      try {
        const storedLastSync = localStorage.getItem(LAST_SYNC_KEY);
        if (storedLastSync) {
          this.lastSyncedAt = new Date(storedLastSync);
        }
      } catch {}

      // Network status listeners
      window.addEventListener('online', () => this.handleOnlineEvent());
      window.addEventListener('offline', () => this.handleOfflineEvent());

      // Service Worker registration & messaging
      this.initServiceWorker();

      // Periodic check for pending items every 20 seconds
      setInterval(() => {
        if (this.isOnline && !this.isSyncing) {
          this.getPendingQueue().then((queue) => {
            if (queue.length > 0) {
              this.syncPendingToFirebase();
            }
          });
        }
      }, 20000);
    }
  }

  // Initialize IndexedDB
  private getIDB(): Promise<IDBDatabase | null> {
    if (this.dbPromise) return this.dbPromise;

    if (typeof window === 'undefined' || !window.indexedDB) {
      this.dbPromise = Promise.resolve(null);
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve) => {
      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_BLUEPRINTS)) {
            db.createObjectStore(STORE_BLUEPRINTS, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(STORE_QUEUE)) {
            const queueStore = db.createObjectStore(STORE_QUEUE, { keyPath: 'id' });
            queueStore.createIndex('by_courseId', 'courseId', { unique: false });
            queueStore.createIndex('by_status', 'status', { unique: false });
          }
        };

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          console.warn('[OfflineSync] IndexedDB open error, falling back to localStorage');
          resolve(null);
        };
      } catch (err) {
        console.warn('[OfflineSync] IndexedDB initialization failed:', err);
        resolve(null);
      }
    });

    return this.dbPromise;
  }

  // Register and connect to Service Worker
  private async initServiceWorker() {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      this.swActive = !!registration.active;

      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'TRIGGER_FIREBASE_AUTO_SYNC') {
          console.log('[OfflineSync] Service worker triggered auto-sync to Firebase');
          this.syncPendingToFirebase();
        }
      });

      // Try registering background sync if supported
      if ('sync' in registration) {
        try {
          // @ts-ignore
          await registration.sync.register('sync-courses-to-firebase');
        } catch {}
      }

      this.notifyListeners();
    } catch (err) {
      console.warn('[OfflineSync] Service Worker registration failed:', err);
    }
  }

  // Handle network online
  private handleOnlineEvent() {
    console.log('[OfflineSync] Network connection restored (online). Triggering automatic Firebase sync.');
    this.isOnline = true;
    this.lastError = null;
    this.notifyListeners();

    // Trigger auto-sync with 400ms delay to let connection stabilize
    if (this.syncTimeout) clearTimeout(this.syncTimeout);
    this.syncTimeout = setTimeout(() => {
      this.syncPendingToFirebase();
    }, 400);
  }

  // Handle network offline
  private handleOfflineEvent() {
    console.warn('[OfflineSync] Connection lost (offline). Blueprints will be stored locally and queued for Firebase sync.');
    this.isOnline = false;
    this.notifyListeners();
  }

  // ---------------------------------------------------------------------------
  // Local Blueprint Storage (IndexedDB + localStorage fallback)
  // ---------------------------------------------------------------------------

  /**
   * Persist a course blueprint locally so the user can continue designing offline.
   * Also enqueues a mutation record for Firebase cloud synchronization.
   */
  public async saveCourseBlueprintOffline(course: Course): Promise<{ success: boolean; queued: boolean }> {
    const nowIso = new Date().toISOString();
    const updatedCourse: Course = {
      ...course,
      updatedAt: course.updatedAt || nowIso,
    };

    // 1. Save to local IndexedDB or localStorage
    try {
      const idb = await this.getIDB();
      if (idb) {
        await new Promise<void>((resolve, reject) => {
          const tx = idb.transaction(STORE_BLUEPRINTS, 'readwrite');
          const store = tx.objectStore(STORE_BLUEPRINTS);
          const req = store.put(updatedCourse);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });
      } else {
        // Fallback localStorage
        this.saveCourseToLocalStorageFallback(updatedCourse);
      }
    } catch (e) {
      console.warn('[OfflineSync] IndexedDB write failed, writing to localStorage fallback:', e);
      this.saveCourseToLocalStorageFallback(updatedCourse);
    }

    // 2. Also notify Service Worker to cache snapshot if available
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_COURSE_SNAPSHOT',
        course: updatedCourse,
      });
    }

    // 3. Enqueue to Firebase Sync Queue
    const queueItem: SyncQueueItem = {
      id: `sync_${course.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      courseId: course.id,
      courseTitle: course.title || 'Untitled Course',
      action: 'upsert',
      courseData: updatedCourse,
      timestamp: nowIso,
      status: 'pending',
      retryCount: 0,
    };

    await this.enqueueSyncItem(queueItem);

    // 4. If online, attempt instant background sync
    if (this.isOnline) {
      this.syncPendingToFirebase().catch(() => {});
    }

    return { success: true, queued: true };
  }

  /**
   * Retrieve a course blueprint by ID from local offline storage.
   */
  public async getCourseBlueprintOffline(id: string): Promise<Course | null> {
    try {
      const idb = await this.getIDB();
      if (idb) {
        return new Promise<Course | null>((resolve) => {
          const tx = idb.transaction(STORE_BLUEPRINTS, 'readonly');
          const store = tx.objectStore(STORE_BLUEPRINTS);
          const req = store.get(id);
          req.onsuccess = () => resolve(req.result || null);
          req.onerror = () => resolve(this.getCourseFromLocalStorageFallback(id));
        });
      }
    } catch {}

    return this.getCourseFromLocalStorageFallback(id);
  }

  /**
   * Retrieve all locally stored course blueprints.
   */
  public async getAllCourseBlueprintsOffline(): Promise<Course[]> {
    try {
      const idb = await this.getIDB();
      if (idb) {
        return new Promise<Course[]>((resolve) => {
          const tx = idb.transaction(STORE_BLUEPRINTS, 'readonly');
          const store = tx.objectStore(STORE_BLUEPRINTS);
          const req = store.getAll();
          req.onsuccess = () => {
            const list: Course[] = req.result || [];
            if (list.length > 0) {
              resolve(list);
            } else {
              resolve(this.getAllCoursesFromLocalStorageFallback());
            }
          };
          req.onerror = () => resolve(this.getAllCoursesFromLocalStorageFallback());
        });
      }
    } catch {}

    return this.getAllCoursesFromLocalStorageFallback();
  }

  // ---------------------------------------------------------------------------
  // Sync Queue Operations
  // ---------------------------------------------------------------------------

  private async enqueueSyncItem(item: SyncQueueItem): Promise<void> {
    try {
      const idb = await this.getIDB();
      if (idb) {
        await new Promise<void>((resolve, reject) => {
          const tx = idb.transaction(STORE_QUEUE, 'readwrite');
          const store = tx.objectStore(STORE_QUEUE);
          const req = store.put(item);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });
      } else {
        this.enqueueToLocalStorageFallback(item);
      }
    } catch (e) {
      this.enqueueToLocalStorageFallback(item);
    }
    this.notifyListeners();
  }

  public async getPendingQueue(): Promise<SyncQueueItem[]> {
    try {
      const idb = await this.getIDB();
      if (idb) {
        return new Promise<SyncQueueItem[]>((resolve) => {
          const tx = idb.transaction(STORE_QUEUE, 'readonly');
          const store = tx.objectStore(STORE_QUEUE);
          const req = store.getAll();
          req.onsuccess = () => {
            const all: SyncQueueItem[] = req.result || [];
            const pending = all.filter((i) => i.status === 'pending' || i.status === 'failed');
            resolve(pending);
          };
          req.onerror = () => resolve(this.getPendingFromLocalStorageFallback());
        });
      }
    } catch {}

    return this.getPendingFromLocalStorageFallback();
  }

  private async removeQueueItem(id: string): Promise<void> {
    try {
      const idb = await this.getIDB();
      if (idb) {
        await new Promise<void>((resolve) => {
          const tx = idb.transaction(STORE_QUEUE, 'readwrite');
          const store = tx.objectStore(STORE_QUEUE);
          const req = store.delete(id);
          req.onsuccess = () => resolve();
          req.onerror = () => resolve();
        });
      }
    } catch {}

    this.removeFromLocalStorageFallback(id);
  }

  private async updateQueueItem(item: SyncQueueItem): Promise<void> {
    try {
      const idb = await this.getIDB();
      if (idb) {
        await new Promise<void>((resolve) => {
          const tx = idb.transaction(STORE_QUEUE, 'readwrite');
          const store = tx.objectStore(STORE_QUEUE);
          const req = store.put(item);
          req.onsuccess = () => resolve();
          req.onerror = () => resolve();
        });
      }
    } catch {}

    this.updateInLocalStorageFallback(item);
  }

  // ---------------------------------------------------------------------------
  // Firebase Firestore Synchronization Engine
  // ---------------------------------------------------------------------------

  /**
   * Automatically process all pending blueprint changes in the queue
   * and push them to Firebase Firestore collection `/courses/{courseId}`.
   */
  public async syncPendingToFirebase(): Promise<{ syncedCount: number; errors: number }> {
    if (this.isSyncing) {
      console.log('[OfflineSync] Sync already in progress, skipping concurrent call.');
      return { syncedCount: 0, errors: 0 };
    }

    if (!this.isOnline) {
      console.log('[OfflineSync] Device is offline, postponing Firebase sync.');
      return { syncedCount: 0, errors: 0 };
    }

    const queue = await this.getPendingQueue();
    if (queue.length === 0) {
      return { syncedCount: 0, errors: 0 };
    }

    this.isSyncing = true;
    this.lastError = null;
    this.notifyListeners();

    let syncedCount = 0;
    let errors = 0;

    console.log(`[OfflineSync] Starting Firebase synchronization for ${queue.length} pending blueprint mutations...`);

    // De-duplicate queue by courseId, keeping the latest mutation
    const latestByCourse = new Map<string, SyncQueueItem>();
    queue.forEach((item) => {
      const existing = latestByCourse.get(item.courseId);
      if (!existing || new Date(item.timestamp).getTime() > new Date(existing.timestamp).getTime()) {
        latestByCourse.set(item.courseId, item);
      }
    });

    for (const [courseId, item] of latestByCourse.entries()) {
      try {
        // Mark item as syncing
        await this.updateQueueItem({ ...item, status: 'syncing' });

        if (item.action === 'upsert' && item.courseData) {
          // Push blueprint document to Firebase Firestore /courses/{courseId}
          const courseDocRef = doc(db, 'courses', courseId);
          await setDoc(
            courseDocRef,
            {
              id: item.courseData.id,
              title: item.courseData.title,
              code: item.courseData.code,
              status: item.courseData.status || 'draft',
              updatedAt: item.courseData.updatedAt || new Date().toISOString(),
              courseData: item.courseData,
              syncedAt: new Date().toISOString(),
              offlineSource: true,
            },
            { merge: true }
          );

          console.log(`[OfflineSync] Successfully synced blueprint ${courseId} ("${item.courseTitle}") to Firebase.`);
          syncedCount++;
        } else if (item.action === 'delete') {
          const courseDocRef = doc(db, 'courses', courseId);
          await deleteDoc(courseDocRef);
          syncedCount++;
        }

        // Clean up resolved queue items for this course
        const allItems = await this.getPendingQueue();
        const itemsForCourse = allItems.filter((q) => q.courseId === courseId);
        for (const qItem of itemsForCourse) {
          await this.removeQueueItem(qItem.id);
        }
      } catch (err: any) {
        console.error(`[OfflineSync] Failed to sync course ${courseId} to Firebase:`, err);
        errors++;
        this.lastError = err?.message || 'Firebase network write failed';
        await this.updateQueueItem({
          ...item,
          status: 'failed',
          retryCount: (item.retryCount || 0) + 1,
          errorMessage: this.lastError,
        });
      }
    }

    this.isSyncing = false;
    this.lastSyncedAt = new Date();
    try {
      localStorage.setItem(LAST_SYNC_KEY, this.lastSyncedAt.toISOString());
    } catch {}

    this.notifyListeners();
    return { syncedCount, errors };
  }

  // ---------------------------------------------------------------------------
  // Subscription & State Access
  // ---------------------------------------------------------------------------

  public async getSyncState(): Promise<SyncState> {
    const queue = await this.getPendingQueue();
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      pendingCount: queue.length,
      lastSyncedAt: this.lastSyncedAt,
      lastError: this.lastError,
      swActive: this.swActive,
      queue,
    };
  }

  public subscribeSyncState(listener: (state: SyncState) => void): () => void {
    this.listeners.add(listener);
    // Send immediate current state
    this.getSyncState().then((state) => listener(state));

    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.getSyncState().then((state) => {
      this.listeners.forEach((listener) => {
        try {
          listener(state);
        } catch (e) {
          console.error('[OfflineSync] Listener threw error:', e);
        }
      });
    });
  }

  // ---------------------------------------------------------------------------
  // LocalStorage Fallbacks
  // ---------------------------------------------------------------------------

  private saveCourseToLocalStorageFallback(course: Course) {
    try {
      const raw = localStorage.getItem(FALLBACK_BLUEPRINTS_KEY);
      const map: Record<string, Course> = raw ? JSON.parse(raw) : {};
      map[course.id] = course;
      localStorage.setItem(FALLBACK_BLUEPRINTS_KEY, JSON.stringify(map));
    } catch {}
  }

  private getCourseFromLocalStorageFallback(id: string): Course | null {
    try {
      const raw = localStorage.getItem(FALLBACK_BLUEPRINTS_KEY);
      if (raw) {
        const map: Record<string, Course> = JSON.parse(raw);
        return map[id] || null;
      }
    } catch {}
    return null;
  }

  private getAllCoursesFromLocalStorageFallback(): Course[] {
    try {
      const raw = localStorage.getItem(FALLBACK_BLUEPRINTS_KEY);
      if (raw) {
        const map: Record<string, Course> = JSON.parse(raw);
        return Object.values(map);
      }
    } catch {}
    return [];
  }

  private enqueueToLocalStorageFallback(item: SyncQueueItem) {
    try {
      const raw = localStorage.getItem(FALLBACK_QUEUE_KEY);
      const list: SyncQueueItem[] = raw ? JSON.parse(raw) : [];
      list.push(item);
      localStorage.setItem(FALLBACK_QUEUE_KEY, JSON.stringify(list));
    } catch {}
  }

  private getPendingFromLocalStorageFallback(): SyncQueueItem[] {
    try {
      const raw = localStorage.getItem(FALLBACK_QUEUE_KEY);
      if (raw) {
        const list: SyncQueueItem[] = JSON.parse(raw);
        return list.filter((i) => i.status === 'pending' || i.status === 'failed');
      }
    } catch {}
    return [];
  }

  private removeFromLocalStorageFallback(id: string) {
    try {
      const raw = localStorage.getItem(FALLBACK_QUEUE_KEY);
      if (raw) {
        const list: SyncQueueItem[] = JSON.parse(raw);
        const filtered = list.filter((i) => i.id !== id);
        localStorage.setItem(FALLBACK_QUEUE_KEY, JSON.stringify(filtered));
      }
    } catch {}
  }

  private updateInLocalStorageFallback(item: SyncQueueItem) {
    try {
      const raw = localStorage.getItem(FALLBACK_QUEUE_KEY);
      if (raw) {
        const list: SyncQueueItem[] = JSON.parse(raw);
        const idx = list.findIndex((i) => i.id === item.id);
        if (idx !== -1) {
          list[idx] = item;
        } else {
          list.push(item);
        }
        localStorage.setItem(FALLBACK_QUEUE_KEY, JSON.stringify(list));
      }
    } catch {}
  }
}

export const offlineSyncService = new OfflineSyncEngine();
