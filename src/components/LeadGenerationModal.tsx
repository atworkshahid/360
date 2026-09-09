import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Building,
  Mail,
  Phone,
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
  Award,
  Users,
  Calendar,
  Send,
  ArrowRight,
  Clock,
  MapPin,
  FileCheck,
  Download,
  Lock,
  Unlock,
  FileText,
} from 'lucide-react';
import { submitInstitutionalLead, setLeadGateUnlocked } from '../services/leadService';
import { AuthUserState, getStoredAuthUser } from '../services/authService';
import { LeadSubmissionPayload } from '../types/lead';

interface LeadGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSource?: string;
  initialFramework?: string;
  isGateMode?: boolean;
  gateFeatureTitle?: string;
  gateFeatureDescription?: string;
  onGateUnlocked?: () => void;
  currentUser?: AuthUserState | null;
}

const ACCREDITATION_FRAMEWORKS = [
  'Washington Accord (IEA / PEC Level II)',
  'ABET (EAC / CAC / ETAC - USA & Global)',
  'Higher Education Commission (HEC Pakistan)',
  'National Board of Accreditation (NBA India / Tier-I)',
  'AACSB (Business Schools Accreditation)',
  'Sydney & Seoul Accords (Engineering Tech / Computing)',
  'CEAB (Engineers Canada)',
  'NAAC (India Higher Education Quality Council)',
  'General Outcome-Based Education (OBE)',
];

const ACADEMIC_ROLES = [
  'Dean of Faculty / School',
  'Vice Chancellor / Rector / Provost',
  'Head of Department (HOD) / Program Chair',
  'Director of Quality Enhancement Cell (QEC / IQAC)',
  'Accreditation Coordinator / Lead Auditor',
  'Senior Faculty Member / Course Coordinator',
  'Instructional Designer / Curriculum Specialist',
  'Other Academic Leader',
];

const FACULTY_SCALES = [
  'Single Department (5–20 Faculty Members)',
  'Faculty / School Level (20–60 Faculty Members)',
  'Multi-Department College (60–150 Faculty Members)',
  'Campus-Wide Institutional License (150+ Faculty Members)',
];

const PRIMARY_NEEDS_OPTIONS = [
  'Upcoming Accreditation Visit Readiness (Dossiers & Self-Study)',
  'CLO-to-PLO Matrix Mapping & Constructive Alignment',
  'Automated Rubrics & Direct Evidence Rules',
  'Active Learning & Bloom Taxonomy Measurement',
  'LMS Course Package Export (Canvas / Moodle / Blackboard)',
  'Faculty Syllabus Standardization & CQI Action Plans',
];

export const LeadGenerationModal: React.FC<LeadGenerationModalProps> = ({
  isOpen,
  onClose,
  initialSource = 'lead_modal',
  initialFramework,
  isGateMode = false,
  gateFeatureTitle,
  gateFeatureDescription,
  onGateUnlocked,
  currentUser,
}) => {
  const activeUser = currentUser ?? getStoredAuthUser();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [institution, setInstitution] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState(ACADEMIC_ROLES[0]);
  const [frameworkInterest, setFrameworkInterest] = useState(
    initialFramework || ACCREDITATION_FRAMEWORKS[0]
  );
  const [facultyCountRange, setFacultyCountRange] = useState(FACULTY_SCALES[1]);
  const [primaryNeeds, setPrimaryNeeds] = useState<string[]>([
    'Upcoming Accreditation Visit Readiness (Dossiers & Self-Study)',
    'CLO-to-PLO Matrix Mapping & Constructive Alignment',
  ]);
  const [timeline, setTimeline] = useState('Within 30 Days (Upcoming Academic Cycle)');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync / Prefill when opened
  useEffect(() => {
    if (isOpen) {
      setIsSubmitted(false);
      setSubmissionId(null);
      setValidationError(null);
      if (initialFramework) {
        setFrameworkInterest(initialFramework);
      }
      if (activeUser) {
        setFullName((prev) => prev || activeUser.name || '');
        setEmail((prev) => prev || activeUser.email || '');
        setInstitution((prev) => prev || activeUser.institution || 'University Faculty of Engineering & Technology');
        setDepartment((prev) => prev || activeUser.department || 'Department of Computer Science & Engineering');
      }
    }
  }, [isOpen, activeUser, initialFramework]);

  if (!isOpen) return null;

  const toggleNeed = (need: string) => {
    setPrimaryNeeds((prev) =>
      prev.includes(need) ? prev.filter((n) => n !== need) : [...prev, need]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!fullName.trim()) {
      setValidationError('Please enter your full name and title.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setValidationError('Please provide a valid institutional or university email address.');
      return;
    }
    if (!institution.trim()) {
      setValidationError('Please provide the name of your university or college.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: LeadSubmissionPayload = {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        institution: institution.trim(),
        department: department.trim() || undefined,
        role,
        frameworkInterest,
        facultyCountRange,
        primaryNeeds,
        timeline,
        message: message.trim() || (isGateMode ? `Unlocked feature: ${gateFeatureTitle || 'Export'}` : undefined),
        source: initialSource || (isGateMode ? 'export_overlay_gate' : 'lead_modal'),
      };

      const result = await submitInstitutionalLead(payload);
      setSubmissionId(result.id);

      if (isGateMode) {
        setLeadGateUnlocked(true);
        if (onGateUnlocked) {
          try {
            onGateUnlocked();
          } catch (gateErr) {
            console.error('Failed to trigger gated action on submit:', gateErr);
          }
        }
      }

      setIsSubmitted(true);
    } catch (err) {
      console.error('Lead submission failed:', err);
      setValidationError('Unable to send inquiry. Please contact hello@mentisera.pk directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInstantUnlockDemo = () => {
    setLeadGateUnlocked(true);
    if (onGateUnlocked) {
      try {
        onGateUnlocked();
      } catch (err) {
        console.error('Failed to trigger unlocked action:', err);
      }
    }
    handleReset();
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setSubmissionId(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full my-8 overflow-hidden text-slate-900 relative animate-fadeIn">
        {/* Header Ribbon */}
        <div className={`p-6 sm:p-7 relative text-white ${
          isGateMode
            ? 'bg-gradient-to-r from-slate-950 via-indigo-950 to-emerald-950 border-b border-indigo-500/20'
            : 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900'
        }`}>
          <button
            onClick={handleReset}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {isGateMode ? (
            <div>
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Institutional Accreditation Export Gate</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold font-serif text-white tracking-tight flex items-center gap-2">
                <span>Unlock {gateFeatureTitle || 'Course Specification & Dossier'}</span>
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-lg leading-relaxed">
                {gateFeatureDescription || 'Verify your academic affiliation below to immediately unlock your downloadable course specification, rubrics, and accreditation dossiers.'}
              </p>

              {/* Target Asset Callout Pill */}
              <div className="mt-3.5 flex items-center justify-between flex-wrap gap-2 bg-white/10 backdrop-blur-xs border border-white/15 rounded-xl px-3.5 py-2">
                <div className="flex items-center space-x-2.5">
                  <Download className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="text-xs text-white">
                    <span className="text-slate-300">Unlocking Asset: </span>
                    <strong className="font-semibold text-white">{gateFeatureTitle || 'Full Course Dossier'}</strong>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Free 1-Time Academic Verification
                </span>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Institutional Consultation &amp; Campus License</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold font-serif text-white tracking-tight">
                Schedule an Institutional Demo &amp; Pilot
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-lg leading-relaxed">
                Connect directly with MENTISERA's Academic Solutions Team to equip your faculty, standardize outcome alignment, and guarantee accreditation audit readiness.
              </p>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 max-h-[75vh] overflow-y-auto">
          {isSubmitted ? (
            <div className="py-8 px-4 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner shadow-emerald-200">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-mono font-bold">
                  Reference: {submissionId}
                </span>
                <h4 className="text-2xl font-bold font-serif text-slate-900">
                  {isGateMode ? 'Export Access Unlocked & Initiated!' : 'Inquiry Successfully Received'}
                </h4>
                <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  {isGateMode ? (
                    <>
                      Thank you, <strong>{fullName}</strong>. Your academic verification for <strong>{institution}</strong> is complete. Your requested asset <strong>({gateFeatureTitle || 'Course Dossier'})</strong> has been unlocked and the download initiated!
                    </>
                  ) : (
                    <>
                      Thank you, <strong>{fullName}</strong>. Your institutional inquiry for <strong>{institution}</strong> has been transmitted to our Lead Curriculum Specialist.
                    </>
                  )}
                </p>
              </div>

              {isGateMode && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-left max-w-md mx-auto space-y-2 text-xs">
                  <div className="font-bold text-emerald-900 flex items-center space-x-1.5">
                    <Download className="w-4 h-4 text-emerald-600" />
                    <span>Download Status &amp; Permanent Unlock</span>
                  </div>
                  <p className="text-emerald-800">
                    If your browser download did not begin automatically due to popup preferences, click the button below to re-trigger the download immediately.
                  </p>
                  <p className="text-emerald-700 text-[11px] font-medium pt-1">
                    ✓ All high-value exports (PDF dossiers, Word .docx specifications, LMS archives) across all courses are now permanently unlocked for this session.
                  </p>
                </div>
              )}

              {/* Next Steps Box (non-gate mode) */}
              {!isGateMode && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left max-w-md mx-auto space-y-2 text-xs">
                  <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <span>What happens next?</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-600 list-disc pl-4">
                    <li>Our academic team will review your target framework ({frameworkInterest}).</li>
                    <li>We will reach out within <strong>24 business hours</strong> via {email}.</li>
                    <li>We will prepare a customized pilot walkthrough with your department's sample syllabus.</li>
                  </ul>
                </div>
              )}

              {/* Direct Contacts Card */}
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3.5 max-w-md mx-auto text-xs text-slate-700 space-y-1">
                <div className="font-semibold text-indigo-950">Urgent or Direct Inquiries:</div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-slate-600 text-xs pt-1">
                  <a href="mailto:hello@mentisera.pk" className="inline-flex items-center space-x-1.5 text-indigo-700 hover:underline font-medium">
                    <Mail className="w-3.5 h-3.5" />
                    <span>hello@mentisera.pk</span>
                  </a>
                  <span className="hidden sm:inline text-slate-300">•</span>
                  <a href="tel:+923348880859" className="inline-flex items-center space-x-1.5 text-emerald-700 hover:underline font-mono font-bold">
                    <Phone className="w-3.5 h-3.5" />
                    <span>+92 334 8880859</span>
                  </a>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                {isGateMode && onGateUnlocked && (
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        onGateUnlocked();
                      } catch (err) {
                        console.error('Download retry error:', err);
                      }
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download File Again</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  Close &amp; Return to Workspace
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {validationError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                  <span className="font-bold">Error:</span>
                  <span>{validationError}</span>
                </div>
              )}

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Full Name &amp; Academic Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Prof. Dr. Sarah Ahmed"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Official Institutional Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="s.ahmed@university.edu"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    University / Institution Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="National University of Sciences & Tech"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Department / Faculty
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Faculty of Engineering / Computing"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Your Academic Role / Designation
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs bg-white"
                  >
                    {ACADEMIC_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Direct Phone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 334 8880859 or +1 415..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Accreditation & Scale */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Target Accreditation Accord
                  </label>
                  <select
                    value={frameworkInterest}
                    onChange={(e) => setFrameworkInterest(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs bg-white"
                  >
                    {ACCREDITATION_FRAMEWORKS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Faculty Scale / Campus Scope
                  </label>
                  <select
                    value={facultyCountRange}
                    onChange={(e) => setFacultyCountRange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs bg-white"
                  >
                    {FACULTY_SCALES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Primary Needs Checkboxes */}
              <div className="pt-2">
                <label className="block font-semibold text-slate-700 mb-2">
                  Primary Educational &amp; Accreditation Needs (Select all that apply):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PRIMARY_NEEDS_OPTIONS.map((need) => {
                    const isChecked = primaryNeeds.includes(need);
                    return (
                      <button
                        type="button"
                        key={need}
                        onClick={() => toggleNeed(need)}
                        className={`text-left p-2 rounded-lg border text-[11px] transition flex items-start space-x-2 cursor-pointer ${
                          isChecked
                            ? 'bg-indigo-50/80 border-indigo-300 text-indigo-900 font-medium'
                            : 'bg-slate-50/60 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                            isChecked
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && <CheckCircle2 className="w-3 h-3" />}
                        </div>
                        <span className="leading-tight">{need}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Implementation Timeline & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                <div className="sm:col-span-1">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Timeline for Adoption
                  </label>
                  <select
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs bg-white"
                  >
                    <option>Within 30 Days (Upcoming Academic Cycle)</option>
                    <option>Next Semester (1–3 Months)</option>
                    <option>Next Academic Year (3–6 Months)</option>
                    <option>Initial Evaluation &amp; Budget Review</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Specific Requirements or Questions (Optional)
                  </label>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="E.g., Need 25 faculty trained on Washington Accord mapping before November visit"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-[11px] text-slate-500 flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {isGateMode
                      ? 'Instant 1-time verification. Unlocks all exports for this session.'
                      : 'Confidential higher-education inquiry. No spam.'}
                  </span>
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-1/2 sm:w-auto px-6 py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-2 cursor-pointer ${
                      isGateMode
                        ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-200'
                        : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-200'
                    }`}
                  >
                    {isGateMode ? (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>{isSubmitting ? 'Verifying & Unlocking...' : 'Unlock & Start Download'}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSubmitting ? 'Transmitting...' : 'Transmit Inquiry'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {isGateMode && (
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={handleInstantUnlockDemo}
                    className="text-[11px] text-slate-400 hover:text-indigo-600 underline cursor-pointer"
                    title="Evaluating software? Click for instant 1-click preview unlock"
                  >
                    Reviewing or evaluating software? Click here for 1-click instant demo unlock
                  </button>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Footer info banner */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>MENTISERA Technologies • Islamabad, Pakistan</span>
          </div>
          <div className="flex items-center space-x-3">
            <a href="mailto:hello@mentisera.pk" className="text-indigo-600 hover:underline">
              hello@mentisera.pk
            </a>
            <span>•</span>
            <a href="tel:+923348880859" className="text-emerald-700 font-bold hover:underline font-mono">
              +92 334 8880859
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
