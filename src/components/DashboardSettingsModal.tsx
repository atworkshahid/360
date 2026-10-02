import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Folder,
  Shield,
  LogOut,
  Loader2,
  Database,
  Layers,
  Info,
  History,
  RotateCcw,
  Sparkles,
  Building2,
} from 'lucide-react';
import {
  isGoogleDriveSyncEnabled,
  setGoogleDriveSyncEnabled,
  getCurrentGoogleUser,
  googleSignIn,
  logoutGoogleDrive,
  getAccessToken,
  initAuth,
} from '../services/googleDriveService';
import { User } from 'firebase/auth';
import { Course } from '../types';
import { CourseVersionHistoryView } from './CourseVersionHistoryView';
import { InstitutionalLogoUploader } from './InstitutionalLogoUploader';

export type SettingsTab = 'history' | 'cloud' | 'storage' | 'branding';

interface DashboardSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses?: Course[];
  initialCourseId?: string;
  initialTab?: SettingsTab;
  totalCoursesCount?: number;
  onRestoreCourse?: (course: Course) => void;
  onExportAllCoursesJSON?: () => void;
  onSettingsChanged?: () => void;
}

export const DashboardSettingsModal: React.FC<DashboardSettingsModalProps> = ({
  isOpen,
  onClose,
  courses = [],
  initialCourseId,
  initialTab = 'history',
  totalCoursesCount,
  onRestoreCourse,
  onExportAllCoursesJSON,
  onSettingsChanged,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    initialCourseId || (courses.length > 0 ? courses[0].id : '')
  );
  const [driveEnabled, setDriveEnabled] = useState<boolean>(isGoogleDriveSyncEnabled());
  const [currentUser, setCurrentUser] = useState<User | null>(getCurrentGoogleUser());
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    setActiveTab(initialTab);
    if (initialCourseId) {
      setSelectedCourseId(initialCourseId);
    } else if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].id);
    }

    setDriveEnabled(isGoogleDriveSyncEnabled());

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
  }, [isOpen, initialCourseId, initialTab]);

  if (!isOpen) return null;

  const count = totalCoursesCount ?? courses.length;

  const handleToggleDrive = (enabled: boolean) => {
    setDriveEnabled(enabled);
    setGoogleDriveSyncEnabled(enabled);
    if (onSettingsChanged) {
      onSettingsChanged();
    }
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 2000);
  };

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const res = await googleSignIn();
      setCurrentUser(res.user);
      setHasToken(true);
      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 2000);
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
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/90">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs">
              <Settings className="w-5 h-5 text-slate-700" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Dashboard & Storage Settings</h2>
              <p className="text-xs text-slate-500">
                Manage version history & restores, cloud integrations, and workspace persistence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 px-6 gap-2 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 px-3 font-bold text-xs flex items-center space-x-2 border-b-2 transition cursor-pointer ${
              activeTab === 'history'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4 text-indigo-600" />
            <span>Version History (Last 5 Saves)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cloud')}
            className={`pb-2.5 px-3 font-bold text-xs flex items-center space-x-2 border-b-2 transition cursor-pointer ${
              activeTab === 'cloud'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <UploadCloud className="w-4 h-4 text-blue-600" />
            <span>Google Drive Sync</span>
            {driveEnabled && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('storage')}
            className={`pb-2.5 px-3 font-bold text-xs flex items-center space-x-2 border-b-2 transition cursor-pointer ${
              activeTab === 'storage'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4 text-slate-600" />
            <span>Storage & Archive</span>
          </button>

          <button
            type="button"
            id="dashboard-settings-tab-branding"
            onClick={() => setActiveTab('branding')}
            className={`pb-2.5 px-3 font-bold text-xs flex items-center space-x-2 border-b-2 transition cursor-pointer ${
              activeTab === 'branding'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span>Institutional Logo &amp; Branding</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 flex-1">
          {/* Notification */}
          {saveSuccessNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Settings updated successfully.</span>
            </div>
          )}

          {/* TAB 1: Version History */}
          {activeTab === 'history' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                    <span>Course Version History & Checkpoint Restore</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Review the last 5 saves for any course. Inspect differences and roll back to previous states instantly.
                  </p>
                </div>
              </div>

              <CourseVersionHistoryView
                courses={courses}
                selectedCourseId={selectedCourseId}
                onSelectCourseId={setSelectedCourseId}
                onRestoreCourse={(restored) => {
                  if (onRestoreCourse) {
                    onRestoreCourse(restored);
                  }
                  if (onSettingsChanged) {
                    onSettingsChanged();
                  }
                }}
              />
            </div>
          )}

          {/* TAB 2: Google Drive Cloud Integration */}
          {activeTab === 'cloud' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <UploadCloud className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Google Drive Cloud Storage Integration
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 max-w-md">
                    Enable or disable syncing course dossiers (PDF) and curricular specifications (JSON) directly to your Google Drive account.
                  </p>
                </div>

                {/* Master Toggle Switch */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={driveEnabled}
                    onChange={(e) => handleToggleDrive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* If Google Drive is enabled */}
              {driveEnabled ? (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Account Connection Status</span>
                    {hasToken && currentUser ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Connected & Active</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        <AlertCircle className="w-3 h-3" />
                        <span>Authorization Required</span>
                      </span>
                    )}
                  </div>

                  {hasToken && currentUser ? (
                    <div className="bg-white rounded-lg p-3 border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {currentUser.photoURL ? (
                          <img
                            src={currentUser.photoURL}
                            alt={currentUser.displayName || 'Google Account'}
                            className="w-9 h-9 rounded-full border border-slate-200"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                            {currentUser.displayName?.[0] || 'G'}
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            {currentUser.displayName || 'Google Account'}
                          </p>
                          <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                        </div>
                      </div>

                      <button
                        onClick={handleSignOut}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-rose-300 text-slate-600 hover:text-rose-600 text-xs font-semibold flex items-center space-x-1 transition cursor-pointer"
                        title="Disconnect Google Account"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Disconnect</span>
                      </button>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg p-3.5 border border-slate-200 text-center space-y-2.5">
                      <p className="text-xs text-slate-600">
                        Sign in with Google to grant permission for saving course files to your Drive.
                      </p>

                      {authError && (
                        <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded border border-rose-200">
                          {authError}
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={handleSignIn}
                        disabled={isAuthenticating}
                        className="inline-flex items-center space-x-2.5 px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs transition cursor-pointer disabled:opacity-60"
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
                  )}

                  {/* Destination folder note */}
                  <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                    <Folder className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>
                      Course documents will sync into a dedicated folder:{' '}
                      <strong className="text-slate-700">"Mentisera OBE360 Courses"</strong>.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-slate-100/70 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start space-x-2">
                  <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <p>
                    Google Drive sync is currently disabled. All your courses remain securely stored in your browser's local workspace. You can re-enable cloud sync at any time.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Local Persistence & Archive */}
          {activeTab === 'storage' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Workspace Storage Status</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block font-bold uppercase text-[10px]">Active Courses</span>
                  <span className="text-xl font-bold text-slate-800 mt-0.5 block">{count}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block font-bold uppercase text-[10px]">Persistence Mode</span>
                  <span className="text-sm font-bold text-emerald-600 mt-1 block">Local Autosave + Version History</span>
                </div>
              </div>

              {onExportAllCoursesJSON && (
                <button
                  type="button"
                  onClick={onExportAllCoursesJSON}
                  className="w-full py-2.5 px-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center space-x-2 transition cursor-pointer shadow-2xs"
                >
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>Export All Courses as JSON Archive</span>
                </button>
              )}
            </div>
          )}

          {/* TAB 4: Institutional Branding & Logo */}
          {activeTab === 'branding' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="bg-indigo-50/60 rounded-xl border border-indigo-100 p-3.5 text-xs text-indigo-900 flex items-start space-x-2.5">
                <Sparkles className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                <div>
                  <div className="font-bold">Accreditation PDF Dossier Branding</div>
                  <div className="text-[11px] text-indigo-700 mt-0.5">
                    Configure institutional crests, university seals, and logos for inclusion on the executive cover page, running header, and formal accreditation compliance certificate of generated PDF dossiers.
                  </div>
                </div>
              </div>

              {courses.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Target Course:
                  </label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code}: {c.title} {c.institutionLogo ? '✓ (Logo uploaded)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(() => {
                const targetCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
                if (!targetCourse) {
                  return (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No courses found in workspace.
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    <InstitutionalLogoUploader
                      currentLogoUrl={targetCourse.institutionLogo}
                      institutionName={targetCourse.institutionName || 'Apex Institute of Science & Technology'}
                      onLogoChange={(dataUrl) => {
                        const updated: Course = { ...targetCourse, institutionLogo: dataUrl };
                        if (onRestoreCourse) onRestoreCourse(updated);
                        setSaveSuccessNotice(true);
                        setTimeout(() => setSaveSuccessNotice(false), 2000);
                      }}
                      onClearLogo={() => {
                        const updated: Course = { ...targetCourse, institutionLogo: undefined };
                        if (onRestoreCourse) onRestoreCourse(updated);
                        setSaveSuccessNotice(true);
                        setTimeout(() => setSaveSuccessNotice(false), 2000);
                      }}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Institution Name
                        </label>
                        <input
                          type="text"
                          value={targetCourse.institutionName || ''}
                          onChange={(e) => {
                            const updated: Course = { ...targetCourse, institutionName: e.target.value };
                            if (onRestoreCourse) onRestoreCourse(updated);
                          }}
                          placeholder="e.g. Apex Institute of Science & Technology"
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Academic Department
                        </label>
                        <input
                          type="text"
                          value={targetCourse.department || ''}
                          onChange={(e) => {
                            const updated: Course = { ...targetCourse, department: e.target.value };
                            if (onRestoreCourse) onRestoreCourse(updated);
                          }}
                          placeholder="e.g. Department of Computer Science"
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            MENTISERA OBE360™ • Version History & Cloud Preferences
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
