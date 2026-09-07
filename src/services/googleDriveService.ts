import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Course } from '../types';
import { generateCoursePDF, PDFExportOptions } from '../utils/pdfExport';

// Initialize Firebase App instance safely (prevent duplicate initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Configure Google Auth Provider with requested Drive scopes
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/drive');

// Flag to indicate if currently processing sign in
let isSigningIn = false;

// In-memory access token cache (NEVER persisted to localStorage/sessionStorage)
let cachedAccessToken: string | null = null;

// Settings persistence key for enabling/disabling Drive integration
const DRIVE_ENABLED_KEY = 'mentisera_obe360_gdrive_sync_enabled';
const DEFAULT_FOLDER_NAME = 'Mentisera OBE360 Courses';

export function isGoogleDriveSyncEnabled(): boolean {
  try {
    const val = localStorage.getItem(DRIVE_ENABLED_KEY);
    // Default to true so user sees the feature ready once OAuth is established
    return val === null ? true : val === 'true';
  } catch {
    return true;
  }
}

export function setGoogleDriveSyncEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(DRIVE_ENABLED_KEY, enabled ? 'true' : 'false');
  } catch (e) {
    console.error('Failed to save Drive sync preference:', e);
  }
}

/**
 * Initialize auth listener. Clears token on sign out.
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Cached token cleared or page refreshed
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Trigger official Google Sign In popup and retrieve access token
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Google Sign-In completed, but no OAuth access token was returned.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Get current cached access token in memory
 */
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

/**
 * Sign out and clear cached token
 */
export const logoutGoogleDrive = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
};

export const getCurrentGoogleUser = (): User | null => {
  return auth.currentUser;
};

export interface DriveSyncResult {
  fileId: string;
  fileName: string;
  webViewLink: string;
  shareableLink?: string;
  isPubliclyShared?: boolean;
  permissionWarning?: string;
  format: 'pdf' | 'json';
  size?: number;
  uploadedAt: string;
  folderName: string;
}

/**
 * Configure file permissions so that anyone with the link can view (role: 'reader').
 * This produces an instant, read-only public link for external collaboration.
 */
export async function setFileAnyoneWithLinkPermission(
  fileId: string,
  accessToken: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}/permissions?supportsAllDrives=true`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'reader',
          type: 'anyone',
          allowFileDiscovery: false,
        }),
      }
    );

    if (res.ok) {
      return { success: true };
    } else {
      const errorText = await res.text();
      console.warn('Google Drive permission update warning:', errorText);
      return {
        success: false,
        error: `Could not set public permissions (${res.status}): ${errorText}`,
      };
    }
  } catch (err: any) {
    console.warn('Network error setting Google Drive file permissions:', err);
    return {
      success: false,
      error: err?.message || 'Network error setting file permissions',
    };
  }
}

/**
 * Helper to update permissions of an existing file in Google Drive to 'anyone with the link'
 */
export async function makeExistingDriveFileShareable(
  fileId: string
): Promise<{ success: boolean; shareableLink: string; error?: string }> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google Drive authorization required.');
  }
  const result = await setFileAnyoneWithLinkPermission(fileId, token);
  return {
    success: result.success,
    shareableLink: `https://drive.google.com/file/d/${fileId}/view?usp=sharing`,
    error: result.error,
  };
}

/**
 * Find or create the dedicated folder in Google Drive
 */
async function getOrCreateDriveFolder(
  accessToken: string,
  folderName: string = DEFAULT_FOLDER_NAME
): Promise<string | null> {
  try {
    // Search for existing folder with exact name that is not in trash
    const query = encodeURIComponent(
      `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
    );
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (searchRes.ok) {
      const data = await searchRes.json();
      if (data.files && data.files.length > 0) {
        return data.files[0].id;
      }
    }

    // Folder doesn't exist, create it
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        description: 'Dedicated cloud archive for MENTISERA OBE360 Course Specifications and Dossiers',
      }),
    });

    if (createRes.ok) {
      const created = await createRes.json();
      return created.id;
    }
  } catch (err) {
    console.warn('Could not establish dedicated folder in Google Drive, defaulting to root:', err);
  }
  return null;
}

/**
 * Upload a Course to Google Drive as either a structured PDF or JSON document
 */
export async function uploadCourseToGoogleDrive({
  course,
  format,
  pdfOptions,
  customFileName,
  folderName = DEFAULT_FOLDER_NAME,
  makeShareable = false,
}: {
  course: Course;
  format: 'pdf' | 'json';
  pdfOptions?: PDFExportOptions;
  customFileName?: string;
  folderName?: string;
  makeShareable?: boolean;
}): Promise<DriveSyncResult> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google Drive authorization required. Please connect your Google account.');
  }

  const cleanCode = (course.code || 'Course').replace(/[^a-zA-Z0-9_-]/g, '_');
  const timestampStr = new Date().toISOString().split('T')[0];

  let fileName = customFileName;
  let fileBlob: Blob;
  let mimeType: string;

  if (format === 'pdf') {
    fileName = fileName || `${cleanCode}_${course.title.slice(0, 35).replace(/[^a-zA-Z0-9_-]/g, '_')}_Dossier_${timestampStr}.pdf`;
    mimeType = 'application/pdf';
    const pdfDoc = generateCoursePDF(course, pdfOptions);
    fileBlob = pdfDoc.output('blob');
  } else {
    fileName = fileName || `${cleanCode}_${course.title.slice(0, 35).replace(/[^a-zA-Z0-9_-]/g, '_')}_Spec_${timestampStr}.json`;
    mimeType = 'application/json';
    const jsonStr = JSON.stringify(
      {
        app: 'MENTISERA OBE360™',
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        course,
      },
      null,
      2
    );
    fileBlob = new Blob([jsonStr], { type: 'application/json' });
  }

  // Find or create parent folder
  const parentFolderId = await getOrCreateDriveFolder(token, folderName);

  // Prepare metadata
  const metadata: Record<string, any> = {
    name: fileName,
    mimeType,
    description: `Outcome-Based Course dossier for ${course.title} (${course.code || 'N/A'}), exported from MENTISERA OBE360™.`,
  };

  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  // Build multipart request body
  const boundary = '-------obe360driveboundary' + Date.now();
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadataPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(
    metadata
  )}`;
  const mediaHeader = `${delimiter}Content-Type: ${mimeType}\r\n\r\n`;

  // Combine into a single multipart Blob
  const multipartBody = new Blob(
    [metadataPart, mediaHeader, fileBlob, closeDelimiter],
    { type: `multipart/related; boundary=${boundary}` }
  );

  const uploadRes = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink,size,mimeType',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: multipartBody,
    }
  );

  if (!uploadRes.ok) {
    const errorText = await uploadRes.text();
    console.error('Drive upload failed:', errorText);
    throw new Error(`Google Drive sync error (${uploadRes.status}): ${errorText}`);
  }

  const result = await uploadRes.json();

  let isPubliclyShared = false;
  let shareableLink = result.webViewLink || `https://drive.google.com/file/d/${result.id}/view?usp=sharing`;
  let permissionWarning: string | undefined;

  // If requested, set file permission to 'anyone with the link' as read-only
  if (makeShareable) {
    const permResult = await setFileAnyoneWithLinkPermission(result.id, token);
    if (permResult.success) {
      isPubliclyShared = true;
      shareableLink = `https://drive.google.com/file/d/${result.id}/view?usp=sharing`;
    } else {
      permissionWarning = permResult.error;
      console.warn('Could not set anyone-with-link permission:', permResult.error);
    }
  }

  return {
    fileId: result.id,
    fileName: result.name || fileName,
    webViewLink:
      result.webViewLink ||
      `https://drive.google.com/file/d/${result.id}/view?usp=drivesdk`,
    shareableLink: makeShareable ? shareableLink : undefined,
    isPubliclyShared,
    permissionWarning,
    format,
    size: result.size ? parseInt(result.size, 10) : fileBlob.size,
    uploadedAt: new Date().toISOString(),
    folderName,
  };
}

/**
 * Bulk upload multiple courses to Google Drive
 */
export async function bulkUploadCoursesToDrive({
  courses,
  format,
  makeShareable = false,
  onProgress,
}: {
  courses: Course[];
  format: 'pdf' | 'json';
  makeShareable?: boolean;
  onProgress?: (completed: number, total: number, currentCourseTitle: string) => void;
}): Promise<{
  succeeded: DriveSyncResult[];
  failed: { courseId: string; title: string; error: string }[];
}> {
  const succeeded: DriveSyncResult[] = [];
  const failed: { courseId: string; title: string; error: string }[] = [];

  for (let i = 0; i < courses.length; i++) {
    const course = courses[i];
    if (onProgress) {
      onProgress(i, courses.length, course.title);
    }
    try {
      const res = await uploadCourseToGoogleDrive({
        course,
        format,
        makeShareable,
      });
      succeeded.push(res);
    } catch (err: any) {
      console.error(`Failed to upload ${course.title}:`, err);
      failed.push({
        courseId: course.id,
        title: course.title,
        error: err?.message || 'Unknown upload error',
      });
    }
  }

  if (onProgress) {
    onProgress(courses.length, courses.length, 'Completed');
  }

  return { succeeded, failed };
}
