import React, { useState, useEffect } from 'react';
import {
  X,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  FileText,
  Code,
  Folder,
  Shield,
  Loader2,
  Lock,
  Sparkles,
  ArrowRight,
  LogOut,
  Eye,
  Share2,
  Link2,
  Copy,
  Globe,
  Check,
} from 'lucide-react';
import { Course } from '../types';
import {
  uploadCourseToGoogleDrive,
  bulkUploadCoursesToDrive,
  googleSignIn,
  logoutGoogleDrive,
  getAccessToken,
  getCurrentGoogleUser,
  initAuth,
  DriveSyncResult,
} from '../services/googleDriveService';
import { User } from 'firebase/auth';
import { PDFPreviewModal } from './PDFPreviewModal';

interface GoogleDriveSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  // If single course is passed:
  course?: Course;
  // If bulk courses are passed:
  courses?: Course[];
  initialFormat?: 'pdf' | 'json';
  initialShareable?: boolean;
  mode?: 'sync' | 'share';
}

export const GoogleDriveSyncModal: React.FC<GoogleDriveSyncModalProps> = ({
  isOpen,
  onClose,
  course,
  courses,
  initialFormat = 'pdf',
  initialShareable,
  mode = 'sync',
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(getCurrentGoogleUser());
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [format, setFormat] = useState<'pdf' | 'json'>(initialFormat);
  const [makeShareable, setMakeShareable] = useState<boolean>(
    initialShareable ?? (mode === 'share')
  );
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedBulkId, setCopiedBulkId] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [progressInfo, setProgressInfo] = useState<{ current: number; total: number; title: string }>({
    current: 0,
    total: 1,
    title: '',
  });

  const [singleResult, setSingleResult] = useState<DriveSyncResult | null>(null);
  const [bulkResult, setBulkResult] = useState<{
    succeeded: DriveSyncResult[];
    failed: { courseId: string; title: string; error: string }[];
  } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState<boolean>(false);
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);

  const isBulk = !!courses && courses.length > 0;
  const targetCourses = isBulk ? courses! : course ? [course] : [];

  // Reset or initialize state when opening
  useEffect(() => {
    if (isOpen) {
      setMakeShareable(initialShareable ?? (mode === 'share'));
      setCopiedLink(false);
      setCopiedBulkId(null);
    }
  }, [isOpen, initialShareable, mode]);

  // Check auth state and token
  useEffect(() => {
    if (!isOpen) return;

    const checkToken = async () => {
      const token = await getAccessToken();
      setHasToken(!!token);
      setCurrentUser(getCurrentGoogleUser());
    };

    checkToken();

    const unsubscribe = initAuth(
      (user) => {
        setCurrentUser(user);
        setHasToken(true);
      },
      () => {
        setCurrentUser(null);
        setHasToken(false);
      }
    );

    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const res = await googleSignIn();
      setCurrentUser(res.user);
      setHasToken(true);
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      setAuthError(err?.message || 'Failed to authenticate with Google Drive.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    await logoutGoogleDrive();
    setCurrentUser(null);
    setHasToken(false);
    setSingleResult(null);
    setBulkResult(null);
  };

  const handleCopyLink = async (url: string, id?: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      if (id) {
        setCopiedBulkId(id);
        setTimeout(() => setCopiedBulkId(null), 2500);
      } else {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      }
    } catch (err) {
      console.error('Failed to copy link to clipboard:', err);
    }
  };

  const handleExecuteSync = async () => {
    setIsUploading(true);
    setUploadError(null);
    setSingleResult(null);
    setBulkResult(null);

    try {
      if (isBulk) {
        setProgressInfo({ current: 0, total: targetCourses.length, title: targetCourses[0]?.title || '' });
        const res = await bulkUploadCoursesToDrive({
          courses: targetCourses,
          format,
          makeShareable,
          onProgress: (current, total, title) => {
            setProgressInfo({ current, total, title });
          },
        });
        setBulkResult(res);
      } else if (course) {
        const res = await uploadCourseToGoogleDrive({
          course,
          format,
          makeShareable,
        });
        setSingleResult(res);
      }
    } catch (err: any) {
      console.error('Drive upload failed:', err);
      setUploadError(err?.message || 'Failed to upload document to Google Drive.');
    } finally {
      setIsUploading(false);
    }
  };

  const resetModal = () => {
    setSingleResult(null);
    setBulkResult(null);
    setUploadError(null);
    setConfirmed(false);
    setCopiedLink(false);
    setCopiedBulkId(null);
    onClose();
  };

  const isShareMode = mode === 'share' || makeShareable;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-2.5">
            <div
              className={`w-9 h-9 rounded-xl border flex items-center justify-center shadow-2xs ${
                isShareMode
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                  : 'bg-blue-50 border-blue-100 text-blue-600'
              }`}
            >
              {isShareMode ? <Share2 className="w-5 h-5" /> : <UploadCloud className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <span>
                  {mode === 'share'
                    ? 'Export Shareable Course Snapshot'
                    : 'Google Drive Sync & Shareable Export'}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                {mode === 'share'
                  ? "Export read-only course snapshot with 'anyone with the link' permissions"
                  : 'Directly export and archive course specifications to your Google Drive'}
              </p>
            </div>
          </div>
          <button
            onClick={resetModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-800">
          {/* Step 1: Authentication State */}
          {!hasToken ? (
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Google Authorization Required</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  To export course snapshots and configure read-only shareable links on Google Drive, please connect your Google account. We only access files created by this application.
                </p>
              </div>

              {authError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start space-x-2 text-left">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Official GSI Styled Button */}
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={isAuthenticating}
                  className="inline-flex items-center space-x-3 px-5 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-xs transition cursor-pointer disabled:opacity-60"
                >
                  {isAuthenticating ? (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 48 48">
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      />
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      />
                    </svg>
                  )}
                  <span>Sign in with Google</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Account Connected Badge */}
              <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  {currentUser?.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'Google Account'}
                      className="w-8 h-8 rounded-full border border-blue-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                      {currentUser?.displayName?.[0] || 'G'}
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-tight">
                      {currentUser?.displayName || 'Google User'}
                    </p>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      {currentUser?.email || 'Connected to Google Drive'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Drive Connected</span>
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Disconnect Google Account"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Success Result View (Single Course) */}
              {singleResult && (
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4.5 space-y-3.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        {singleResult.isPubliclyShared
                          ? 'Read-Only Snapshot Exported & Shareable Link Ready!'
                          : 'Successfully Exported & Synced to Google Drive!'}
                      </span>
                    </div>
                    {singleResult.isPubliclyShared && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-200 text-emerald-900 border border-emerald-300 shrink-0">
                        <Globe className="w-3 h-3 text-emerald-700" />
                        <span>Anyone with link can view</span>
                      </span>
                    )}
                  </div>

                  {/* Shareable Link Box if generated */}
                  {singleResult.shareableLink && (
                    <div className="bg-white rounded-xl p-3.5 border border-emerald-200 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                        <span className="flex items-center space-x-1.5">
                          <Link2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Shareable Read-Only Link:</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          Read-only snapshot • Anyone with link
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          readOnly
                          value={singleResult.shareableLink}
                          onClick={(e) => (e.target as HTMLInputElement).select()}
                          className="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-700 select-all focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                        />
                        <button
                          type="button"
                          id="copy-single-shareable-link-btn"
                          onClick={() => handleCopyLink(singleResult.shareableLink!)}
                          className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer ${
                            copiedLink
                              ? 'bg-emerald-700 text-white'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          }`}
                        >
                          {copiedLink ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="bg-white rounded-lg p-3 border border-emerald-100 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">File Name:</span>
                      <span className="font-semibold text-slate-800 truncate max-w-xs">
                        {singleResult.fileName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Destination:</span>
                      <span className="font-medium text-slate-700 flex items-center space-x-1">
                        <Folder className="w-3 h-3 text-amber-500 inline" />
                        <span>Google Drive &gt; {singleResult.folderName}</span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Snapshot Format:</span>
                      <span className="uppercase font-bold text-indigo-600">
                        {singleResult.format} Document
                      </span>
                    </div>
                    {singleResult.isPubliclyShared && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Access Permission:</span>
                        <span className="font-semibold text-emerald-700">
                          Viewer (Anyone with the link)
                        </span>
                      </div>
                    )}
                  </div>

                  {singleResult.permissionWarning && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        Note: Could not set public permissions automatically ({singleResult.permissionWarning}).
                        You can adjust sharing permissions directly inside your Google Drive.
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {singleResult.shareableLink && (
                      <button
                        type="button"
                        onClick={() => handleCopyLink(singleResult.shareableLink!)}
                        className="inline-flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>{copiedLink ? 'Copied to Clipboard' : 'Copy Shareable Link'}</span>
                      </button>
                    )}
                    <a
                      href={singleResult.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition ${
                        !singleResult.shareableLink ? 'col-span-2' : ''
                      }`}
                    >
                      <span>Open in Google Drive</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}

              {/* Bulk Result View */}
              {bulkResult && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-emerald-700 flex items-center space-x-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{bulkResult.succeeded.length} Courses Exported</span>
                    </span>
                    {bulkResult.failed.length > 0 && (
                      <span className="text-rose-600">
                        {bulkResult.failed.length} Failed
                      </span>
                    )}
                  </div>

                  <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                    {bulkResult.succeeded.map((item) => (
                      <div
                        key={item.fileId}
                        className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <span className="font-semibold text-slate-800 truncate max-w-xs">
                          {item.fileName}
                        </span>
                        <div className="flex items-center space-x-2 shrink-0">
                          {item.shareableLink && (
                            <button
                              type="button"
                              onClick={() => handleCopyLink(item.shareableLink!, item.fileId)}
                              className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center space-x-1 text-[11px] cursor-pointer"
                              title="Copy shareable link"
                            >
                              {copiedBulkId === item.fileId ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy Link</span>
                                </>
                              )}
                            </button>
                          )}
                          <a
                            href={item.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center space-x-1 text-[11px]"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Error Banner */}
              {uploadError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Configuration & Confirmation (if not already completed) */}
              {!singleResult && !bulkResult && (
                <div className="space-y-4">
                  {/* Format Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Select Snapshot Format:
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormat('pdf')}
                        className={`p-3 rounded-xl border text-left flex items-start space-x-2.5 transition cursor-pointer ${
                          format === 'pdf'
                            ? 'border-indigo-600 bg-indigo-50/50 shadow-2xs ring-1 ring-indigo-500'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <FileText
                          className={`w-5 h-5 shrink-0 mt-0.5 ${
                            format === 'pdf' ? 'text-indigo-600' : 'text-slate-400'
                          }`}
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900">Structured PDF Dossier</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Accreditation dossier with audit tables, CLO-PLO matrix, and rubrics. Ideal for read-only sharing.
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormat('json')}
                        className={`p-3 rounded-xl border text-left flex items-start space-x-2.5 transition cursor-pointer ${
                          format === 'json'
                            ? 'border-indigo-600 bg-indigo-50/50 shadow-2xs ring-1 ring-indigo-500'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <Code
                          className={`w-5 h-5 shrink-0 mt-0.5 ${
                            format === 'json' ? 'text-indigo-600' : 'text-slate-400'
                          }`}
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900">JSON Specification</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Machine-readable curriculum schema for LMS backup and SIS imports.
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Shareable Permission Configuration Toggle */}
                  <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        id="modal-make-shareable-checkbox"
                        checked={makeShareable}
                        onChange={(e) => setMakeShareable(e.target.checked)}
                        className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 mt-0.5"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-emerald-950 flex items-center space-x-1.5">
                            <Globe className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Set Permissions to 'Anyone with the link can view'</span>
                          </span>
                          <span className="px-1.5 py-0.5 bg-emerald-200 text-emerald-900 rounded text-[10px] font-bold">
                            Read-Only Snapshot
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-800 leading-relaxed">
                          Enables public reader permissions on Google Drive so external accreditation reviewers, instructional designers, and committee members can view the course snapshot immediately without requesting access.
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Target Description */}
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-semibold">Target Document(s):</span>
                      <span className="font-bold text-indigo-700">
                        {isBulk ? `${targetCourses.length} Courses` : course?.title}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 text-[11px]">
                      <span>Destination Folder:</span>
                      <span className="flex items-center space-x-1 font-medium">
                        <Folder className="w-3.5 h-3.5 text-amber-500" />
                        <span>Google Drive / Mentisera OBE360 Courses</span>
                      </span>
                    </div>
                    {course && (
                      <div className="flex items-center justify-between text-slate-600 text-[11px] pt-1 border-t border-slate-200/60">
                        <span>Course Specs:</span>
                        <span>
                          {course.clos.length} CLOs • {course.modules.length} Modules •{' '}
                          {course.assessments.length} Assessments
                        </span>
                      </div>
                    )}

                    {/* Preview PDF Document format before syncing */}
                    {format === 'pdf' && (
                      <div className="pt-2 border-t border-slate-200/60">
                        {!isBulk && course && (
                          <div className="flex items-center justify-between bg-indigo-50/70 p-2.5 rounded-lg border border-indigo-100">
                            <div className="flex items-center space-x-2 text-[11px] text-indigo-900 font-medium">
                              <Eye className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                              <span>Review document format before syncing to Drive:</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewCourse(course);
                                setPreviewModalOpen(true);
                              }}
                              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer shadow-2xs"
                              title="Generate temporary blob URL and preview PDF dossier"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Preview PDF</span>
                            </button>
                          </div>
                        )}

                        {isBulk && targetCourses.length > 0 && (
                          <div className="space-y-1.5 bg-slate-100/70 p-2.5 rounded-lg border border-slate-200">
                            <div className="flex items-center justify-between text-[11px] text-slate-700 font-medium">
                              <span className="flex items-center space-x-1">
                                <Eye className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Preview document format for any selected course:</span>
                              </span>
                              <span className="text-[10px] text-slate-400">Temporary Blob URL</span>
                            </div>
                            <div className="max-h-24 overflow-y-auto space-y-1 pr-0.5">
                              {targetCourses.map((c) => (
                                <div
                                  key={c.id}
                                  className="bg-white px-2 py-1.5 rounded border border-slate-200 flex items-center justify-between text-xs"
                                >
                                  <span className="font-medium text-slate-800 truncate max-w-[240px]">
                                    {c.code ? `[${c.code}] ` : ''}{c.title}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPreviewCourse(c);
                                      setPreviewModalOpen(true);
                                    }}
                                    className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center space-x-1 text-[11px] cursor-pointer shrink-0 ml-2"
                                  >
                                    <Eye className="w-3 h-3" />
                                    <span>Preview PDF</span>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Mandatory Explicit Confirmation Dialog */}
                  <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs space-y-2">
                    <div className="flex items-start space-x-2">
                      <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-bold text-amber-900">
                          Workspace Confirmation Required
                        </p>
                        <p className="text-amber-800 text-[11px] leading-relaxed">
                          This operation will export and save{' '}
                          <strong>
                            {isBulk
                              ? `${targetCourses.length} snapshot files`
                              : `1 ${format.toUpperCase()} snapshot document`}
                          </strong>{' '}
                          in your personal Google Drive account under{' '}
                          <em>"Mentisera OBE360 Courses"</em>
                          {makeShareable
                            ? ", and configure public read-only link permissions ('anyone with the link')."
                            : '.'}
                        </p>
                      </div>
                    </div>
                    <label className="flex items-center space-x-2 pt-1 border-t border-amber-200/60 text-amber-950 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={confirmed}
                        onChange={(e) => setConfirmed(e.target.checked)}
                        className="rounded border-amber-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                      />
                      <span className="text-[11px]">
                        Yes, I authorize Mentisera OBE360 to export this snapshot to my Google Drive.
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={resetModal}
            className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            {singleResult || bulkResult ? 'Close' : 'Cancel'}
          </button>

          {hasToken && !singleResult && !bulkResult && (
            <button
              type="button"
              id="execute-drive-sync-btn"
              onClick={handleExecuteSync}
              disabled={!confirmed || isUploading}
              className={`inline-flex items-center space-x-2 px-5 py-2 rounded-lg disabled:opacity-50 text-white text-xs font-bold shadow-xs transition cursor-pointer ${
                makeShareable
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-200'
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-200'
              }`}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    {makeShareable ? 'Exporting & Sharing...' : 'Syncing...'}{' '}
                    {isBulk
                      ? `(${progressInfo.current + 1}/${progressInfo.total})`
                      : ''}
                  </span>
                </>
              ) : (
                <>
                  {makeShareable ? <Share2 className="w-4 h-4" /> : <UploadCloud className="w-4 h-4" />}
                  <span>
                    {makeShareable
                      ? `Export & Create Shareable Link (${format.toUpperCase()})`
                      : `Sync to Google Drive (${format.toUpperCase()})`}
                  </span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Preview PDF Modal */}
      {previewCourse && (
        <PDFPreviewModal
          isOpen={previewModalOpen}
          onClose={() => {
            setPreviewModalOpen(false);
            setPreviewCourse(null);
          }}
          course={previewCourse}
          onProceedToDriveSync={() => {
            setPreviewModalOpen(false);
            setPreviewCourse(null);
            setConfirmed(true);
          }}
        />
      )}
    </div>
  );
};

