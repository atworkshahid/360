import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Shield,
  Clock,
  Lock,
  Eye,
  MessageSquare,
  FileDown,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Trash2,
  Sliders,
  Calendar,
  Globe,
  UserCheck,
} from 'lucide-react';
import { Course, AppUser } from '../types';
import {
  ShareService,
  SharedCourseRecord,
  CreateShareOptions,
  SharePermissionLevel,
} from '../services/shareService';
import { MentiseraLogo } from './Logo';

interface ShareCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  currentUser?: AppUser | null;
}

export const ShareCourseModal: React.FC<ShareCourseModalProps> = ({
  isOpen,
  onClose,
  course,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');
  const [permissionLevel, setPermissionLevel] = useState<SharePermissionLevel>('public_read');
  const [allowComments, setAllowComments] = useState<boolean>(true);
  const [allowExport, setAllowExport] = useState<boolean>(true);
  const [expirationDays, setExpirationDays] = useState<number | null>(30);
  const [passcode, setPasscode] = useState<string>('');
  const [requirePasscode, setRequirePasscode] = useState<boolean>(false);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedRecord, setGeneratedRecord] = useState<SharedCourseRecord | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [existingShares, setExistingShares] = useState<SharedCourseRecord[]>([]);
  const [isLoadingShares, setIsLoadingShares] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Load existing shares when modal opens
  const loadExistingShares = async () => {
    setIsLoadingShares(true);
    try {
      const shares = await ShareService.getCourseShares(course.id);
      setExistingShares(shares);
      if (shares.length > 0 && !generatedRecord) {
        setGeneratedRecord(shares[0]);
      }
    } catch (err) {
      console.warn('Failed to load existing shares:', err);
    } finally {
      setIsLoadingShares(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadExistingShares();
      setCopiedLink(false);
      setActionMessage(null);
    }
  }, [isOpen, course.id]);

  if (!isOpen) return null;

  const handleGenerateShare = async () => {
    setIsGenerating(true);
    setActionMessage(null);
    try {
      const options: CreateShareOptions = {
        permissionLevel,
        allowReviewerComments: allowComments,
        allowExport,
        expiresInDays: expirationDays,
        passcode: requirePasscode && passcode.trim().length > 0 ? passcode.trim() : null,
      };

      const record = await ShareService.createShareLink(course, options, currentUser);
      setGeneratedRecord(record);
      setExistingShares((prev) => [record, ...prev]);
      setActiveTab('create');
      setActionMessage('Unique shareable link generated and registered in Firebase Firestore!');
    } catch (err) {
      console.error('Error generating share link:', err);
      setActionMessage('Failed to generate share link. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleRevoke = async (shareId: string) => {
    try {
      await ShareService.revokeShare(shareId);
      setExistingShares((prev) =>
        prev.map((s) => (s.shareId === shareId ? { ...s, isActive: false } : s))
      );
      if (generatedRecord?.shareId === shareId) {
        setGeneratedRecord((prev) => (prev ? { ...prev, isActive: false } : null));
      }
      setActionMessage('Share link revoked. Reviewers will no longer have access.');
    } catch (err) {
      console.error('Failed to revoke share:', err);
    }
  };

  const handleRestore = async (shareId: string) => {
    try {
      await ShareService.restoreShare(shareId);
      setExistingShares((prev) =>
        prev.map((s) => (s.shareId === shareId ? { ...s, isActive: true } : s))
      );
      if (generatedRecord?.shareId === shareId) {
        setGeneratedRecord((prev) => (prev ? { ...prev, isActive: true } : null));
      }
      setActionMessage('Share link restored successfully.');
    } catch (err) {
      console.error('Failed to restore share:', err);
    }
  };

  const currentShareUrl = generatedRecord
    ? ShareService.getShareUrl(generatedRecord.shareId)
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between relative border-b border-indigo-900/50">
          <div className="flex items-center gap-3">
            <MentiseraLogo size="sm" variant="light" showText={false} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">Share Course Blueprint</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  Firestore ABAC
                </span>
              </div>
              <p className="text-xs text-indigo-200/80 truncate max-w-md">
                {course.code} &bull; {course.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('create')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'create'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Share2 className="w-4 h-4" />
            Generate Share Link
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'manage'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Manage Permissions ({existingShares.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {actionMessage && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionMessage}</span>
            </div>
          )}

          {activeTab === 'create' ? (
            <>
              {/* Active / Last Generated Link Display */}
              {generatedRecord && (
                <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block w-2.5 h-2.5 rounded-full ${
                          generatedRecord.isActive ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      />
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        {generatedRecord.isActive ? 'Active Read-Only Link' : 'Revoked Share Link'}
                      </span>
                    </div>
                    {generatedRecord.expiresAt && (
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        Expires {new Date(generatedRecord.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* URL Input Box */}
                  <div className="flex items-center gap-2 bg-white rounded-lg p-1.5 border border-indigo-200">
                    <input
                      type="text"
                      readOnly
                      value={currentShareUrl}
                      className="w-full bg-transparent px-2.5 py-1 text-xs text-slate-700 font-mono focus:outline-none select-all"
                    />
                    <button
                      onClick={() => handleCopy(currentShareUrl)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm shrink-0"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedLink ? 'Copied' : 'Copy Link'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        window.dispatchEvent(
                          new CustomEvent('open_shared_blueprint', {
                            detail: { shareId: generatedRecord.shareId },
                          })
                        );
                        onClose();
                      }}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-md text-xs font-medium flex items-center gap-1 transition-colors border border-slate-200 shrink-0"
                      title="Preview this shared blueprint in reviewer mode"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Preview</span>
                    </button>
                    <a
                      href={currentShareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-slate-100 transition-colors"
                      title="Open in new window"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                    <span className="bg-white/80 px-2 py-0.5 rounded border border-indigo-100">
                      Views: <strong className="text-slate-800">{generatedRecord.accessCount || 0}</strong>
                    </span>
                    <span className="bg-white/80 px-2 py-0.5 rounded border border-indigo-100">
                      Comments: <strong className="text-slate-800">{generatedRecord.allowReviewerComments ? 'Allowed' : 'Disabled'}</strong>
                    </span>
                    <span className="bg-white/80 px-2 py-0.5 rounded border border-indigo-100">
                      Export: <strong className="text-slate-800">{generatedRecord.allowExport ? 'Permitted' : 'Disabled'}</strong>
                    </span>
                    {generatedRecord.passcode && (
                      <span className="bg-white/80 px-2 py-0.5 rounded border border-indigo-100 text-amber-700 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-amber-600" />
                        PIN Protected: {generatedRecord.passcode}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Permission & Access Options */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  Access Level & Permissions
                </h4>

                {/* Permission Level Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPermissionLevel('public_read')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      permissionLevel === 'public_read'
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-600/30'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Globe className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs font-bold text-slate-900">Anyone with Link</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Instant read-only review without requiring account sign-in.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPermissionLevel('reviewer_only')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      permissionLevel === 'reviewer_only'
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-600/30'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <UserCheck className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-bold text-slate-900">Peer Reviewer</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Optimized for external curriculum auditors & BoS members.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPermissionLevel('restricted')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      permissionLevel === 'restricted'
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-600/30'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Lock className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-bold text-slate-900">Restricted / PIN</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Protected with an optional 4-digit access code.
                    </p>
                  </button>
                </div>

                {/* Granular Toggles */}
                <div className="space-y-3 pt-2">
                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <MessageSquare className="w-4 h-4 text-indigo-600" />
                      <div>
                        <div className="text-xs font-semibold text-slate-900">Allow Reviewer Comments & Feedback</div>
                        <div className="text-[11px] text-slate-500">Reviewers can submit suggestions on learning outcomes & assessments</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={allowComments}
                      onChange={(e) => setAllowComments(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <FileDown className="w-4 h-4 text-indigo-600" />
                      <div>
                        <div className="text-xs font-semibold text-slate-900">Allow Syllabus & Dossier PDF Export</div>
                        <div className="text-[11px] text-slate-500">Permit external reviewers to download official course documentation</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={allowExport}
                      onChange={(e) => setAllowExport(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                  </label>
                </div>

                {/* Expiration & Passcode Config */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      Link Expiration
                    </label>
                    <select
                      value={expirationDays === null ? 'never' : String(expirationDays)}
                      onChange={(e) => {
                        const val = e.target.value;
                        setExpirationDays(val === 'never' ? null : parseInt(val, 10));
                      }}
                      className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="7">Expires in 7 days</option>
                      <option value="30">Expires in 30 days (Recommended)</option>
                      <option value="90">Expires in 90 days (Full Semester)</option>
                      <option value="never">Never expires</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                        Passcode / PIN Gate
                      </label>
                      <input
                        type="checkbox"
                        checked={requirePasscode}
                        onChange={(e) => setRequirePasscode(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-indigo-600"
                      />
                    </div>
                    <input
                      type="text"
                      disabled={!requirePasscode}
                      placeholder={requirePasscode ? 'e.g. 2026' : 'Passcode disabled'}
                      maxLength={8}
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      className={`w-full text-xs rounded-lg border px-3 py-2 ${
                        requirePasscode
                          ? 'border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500'
                          : 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Generate CTA Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleGenerateShare}
                  disabled={isGenerating}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Registering with Firebase Firestore...
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      Generate New Unique Share Link
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Manage Permissions Tab */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Active Share Records ({existingShares.length})
                </span>
                <button
                  onClick={loadExistingShares}
                  className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingShares ? 'animate-spin' : ''}`} />
                  Refresh Firestore
                </button>
              </div>

              {existingShares.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
                  <Share2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-medium">No active share links found for this course.</p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="mt-3 text-xs text-indigo-600 hover:underline font-semibold"
                  >
                    Generate your first share link &rarr;
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {existingShares.map((item) => {
                    const itemUrl = ShareService.getShareUrl(item.shareId);
                    const isExpired = item.expiresAt ? new Date(item.expiresAt).getTime() < Date.now() : false;

                    return (
                      <div
                        key={item.shareId}
                        className={`p-3.5 rounded-xl border transition-all ${
                          !item.isActive
                            ? 'bg-slate-50 border-slate-200 opacity-60'
                            : isExpired
                            ? 'bg-amber-50/50 border-amber-200'
                            : 'bg-white border-slate-200 hover:border-indigo-300 shadow-sm'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  !item.isActive
                                    ? 'bg-rose-100 text-rose-700'
                                    : isExpired
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-emerald-100 text-emerald-700'
                                }`}
                              >
                                {!item.isActive ? 'Revoked' : isExpired ? 'Expired' : 'Active'}
                              </span>
                              <span className="text-xs font-semibold text-slate-900 font-mono">
                                {item.shareId}
                              </span>
                              <span className="text-[11px] text-slate-500 font-normal">
                                &bull; Created {new Date(item.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {item.isActive ? (
                              <button
                                onClick={() => handleRevoke(item.shareId)}
                                className="px-2.5 py-1 text-[11px] font-medium text-rose-600 hover:bg-rose-50 rounded border border-rose-200 transition-colors"
                              >
                                Revoke
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRestore(item.shareId)}
                                className="px-2.5 py-1 text-[11px] font-medium text-emerald-600 hover:bg-emerald-50 rounded border border-emerald-200 transition-colors"
                              >
                                Restore
                              </button>
                            )}
                            <button
                              onClick={() => handleCopy(itemUrl)}
                              className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100"
                              title="Copy Link"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                window.dispatchEvent(
                                  new CustomEvent('open_shared_blueprint', {
                                    detail: { shareId: item.shareId },
                                  })
                                );
                                onClose();
                              }}
                              className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100"
                              title="Preview in Reviewer Mode"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <a
                              href={itemUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100"
                              title="Open in new window"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>

                        {/* Specs & Permissions Badges */}
                        <div className="flex flex-wrap gap-2 text-[10px] text-slate-500 pt-1 border-t border-slate-100 mt-2">
                          <span>
                            Level: <strong className="text-slate-700">{item.permissionLevel}</strong>
                          </span>
                          <span>&bull;</span>
                          <span>
                            Views: <strong className="text-slate-700">{item.accessCount || 0}</strong>
                          </span>
                          <span>&bull;</span>
                          <span>
                            Comments: <strong className="text-slate-700">{item.allowReviewerComments ? 'Allowed' : 'Off'}</strong>
                          </span>
                          <span>&bull;</span>
                          <span>
                            Export: <strong className="text-slate-700">{item.allowExport ? 'Yes' : 'No'}</strong>
                          </span>
                          {item.expiresAt && (
                            <>
                              <span>&bull;</span>
                              <span className="text-slate-600">
                                Expires: {new Date(item.expiresAt).toLocaleDateString()}
                              </span>
                            </>
                          )}
                          {item.passcode && (
                            <>
                              <span>&bull;</span>
                              <span className="text-amber-700 font-mono">PIN: {item.passcode}</span>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Zero-Trust Read-Only Protection Active</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
