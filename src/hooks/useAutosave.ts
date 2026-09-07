import { useState, useEffect, useRef, useCallback } from 'react';

export type AutoSaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

interface UseAutosaveOptions<T> {
  storageKey: string;
  data: T;
  debounceMs?: number;
  periodicIntervalMs?: number;
  activeCourseId?: string;
  onBeforeSave?: (data: T, timestamp: string) => T;
  onAfterSave?: (savedData: T, timestamp: string) => void;
}

export interface UseAutosaveReturn<T> {
  status: AutoSaveStatus;
  lastSaved: Date | null;
  errorMessage: string | null;
  saveNow: () => void;
}

export function useAutosave<T>({
  storageKey,
  data,
  debounceMs = 800,
  periodicIntervalMs = 30000,
  activeCourseId,
  onBeforeSave,
  onAfterSave,
}: UseAutosaveOptions<T>): UseAutosaveReturn<T> {
  // Initialize lastSaved from localStorage if available
  const [lastSaved, setLastSaved] = useState<Date | null>(() => {
    try {
      const stored = localStorage.getItem(`${storageKey}_last_saved`);
      if (stored) {
        const d = new Date(stored);
        if (!isNaN(d.getTime())) return d;
      }
    } catch (e) {
      console.warn('Failed to read last_saved from localStorage:', e);
    }
    return new Date();
  });

  const [status, setStatus] = useState<AutoSaveStatus>('saved');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Keep latest refs for data and callbacks to avoid stale closures in timeouts
  const dataRef = useRef<T>(data);
  dataRef.current = data;

  const onBeforeSaveRef = useRef(onBeforeSave);
  onBeforeSaveRef.current = onBeforeSave;

  const onAfterSaveRef = useRef(onAfterSave);
  onAfterSaveRef.current = onAfterSave;

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef<boolean>(true);
  const isSavingRef = useRef<boolean>(false);
  const hasUnsavedChangesRef = useRef<boolean>(false);

  // Core save function
  const performSave = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    try {
      setStatus('saving');
      setErrorMessage(null);
      isSavingRef.current = true;

      const now = new Date();
      const timestampIso = now.toISOString();

      let dataToSave = dataRef.current;
      if (onBeforeSaveRef.current) {
        dataToSave = onBeforeSaveRef.current(dataToSave, timestampIso);
      }

      // Serialize and persist to localStorage
      localStorage.setItem(storageKey, JSON.stringify(dataToSave));
      localStorage.setItem(`${storageKey}_last_saved`, timestampIso);
      localStorage.setItem(
        `${storageKey}_metadata`,
        JSON.stringify({
          lastSavedAt: timestampIso,
          version: '1.0',
          activeCourseId: activeCourseId || null,
        })
      );

      setLastSaved(now);
      setStatus('saved');
      hasUnsavedChangesRef.current = false;

      if (onAfterSaveRef.current) {
        try {
          onAfterSaveRef.current(dataToSave, timestampIso);
        } catch (e) {
          console.warn('onAfterSave callback error:', e);
        }
      }
    } catch (err: unknown) {
      console.error('Autosave to localStorage failed:', err);
      const message = err instanceof Error ? err.message : 'Storage quota exceeded or unavailable';
      setErrorMessage(message);
      setStatus('error');
    } finally {
      isSavingRef.current = false;
    }
  }, [storageKey, activeCourseId]);

  // Debounced autosave effect on data change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    hasUnsavedChangesRef.current = true;
    setStatus('unsaved');

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      performSave();
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [data, debounceMs, performSave]);

  // Periodic autosave effect (heartbeat persistence)
  useEffect(() => {
    if (periodicIntervalMs <= 0) return;

    const intervalId = setInterval(() => {
      // If there are unsaved changes or to ensure periodic timestamp sync
      if (hasUnsavedChangesRef.current) {
        performSave();
      }
    }, periodicIntervalMs);

    return () => clearInterval(intervalId);
  }, [periodicIntervalMs, performSave]);

  // Save before unload / window blur
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (hasUnsavedChangesRef.current) {
        performSave();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [performSave]);

  return {
    status,
    lastSaved,
    errorMessage,
    saveNow: performSave,
  };
}
