import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  Building2,
  ShieldCheck,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  FileText,
  Palette,
  Eye,
  Save,
  Download,
  RotateCcw,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Course } from '../types';
import { InstitutionalLogoUploader } from './InstitutionalLogoUploader';
import { getStoredInstitution, saveStoredInstitution } from '../data/institutionData';
import { downloadCoursePDF } from '../utils/pdfExport';
import { PDFPreviewModal } from './PDFPreviewModal';
import { DossierThemeSelector } from './DossierThemeSelector';
import { DOSSIER_THEME_PRESETS } from '../utils/dossierThemePresets';

export type CourseSettingsTab = 'branding' | 'accreditation' | 'academic' | 'preview';

interface CourseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  onSave: (updatedCourse: Course) => void;
  onOpenDossierPreview?: () => void;
}

export const CourseSettingsModal: React.FC<CourseSettingsModalProps> = ({
  isOpen,
  onClose,
  course,
  onSave,
  onOpenDossierPreview,
}) => {
  const [activeTab, setActiveTab] = useState<CourseSettingsTab>('branding');

  // Form State
  const [institutionName, setInstitutionName] = useState<string>(
    course.institutionName || getStoredInstitution().name || 'Apex Institute of Science & Technology'
  );
  const [institutionLogo, setInstitutionLogo] = useState<string>(
    course.institutionLogo || getStoredInstitution().logoUrl || ''
  );
  const [department, setDepartment] = useState<string>(
    course.department || getStoredInstitution().department || 'Department of Computer Science & Software Engineering'
  );
  const [programme, setProgramme] = useState<string>(course.programme || '');
  const [accreditationFramework, setAccreditationFramework] = useState<string>(
    course.accreditationFramework || 'Washington Accord (IEA WA-ENG)'
  );
  const [instructorName, setInstructorName] = useState<string>(course.instructorName || '');
  const [courseCoordinator, setCourseCoordinator] = useState<string>(course.courseCoordinator || '');
  const [passingBenchmark, setPassingBenchmark] = useState<number>(course.passingBenchmark || 60);
  const [academicYear, setAcademicYear] = useState<string>(course.academicYear || '2025–2026');
  const [semester, setSemester] = useState<string>(course.semester || 'Semester I');
  const [dossierColorTheme, setDossierColorTheme] = useState<string>(
    course.dossierColorTheme || getStoredInstitution().defaultDossierColorTheme || 'navy'
  );
  const [dossierPrimaryColor, setDossierPrimaryColor] = useState<string>(
    course.dossierPrimaryColor || getStoredInstitution().defaultDossierPrimaryColor || ''
  );
  const [dossierAccentColor, setDossierAccentColor] = useState<string>(
    course.dossierAccentColor || getStoredInstitution().defaultDossierAccentColor || ''
  );
  const [syncToAllCourses, setSyncToAllCourses] = useState<boolean>(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [nestedPreviewOpen, setNestedPreviewOpen] = useState<boolean>(false);

  // Sync state when course changes
  useEffect(() => {
    if (!isOpen) return;
    setInstitutionName(
      course.institutionName || getStoredInstitution().name || 'Apex Institute of Science & Technology'
    );
    setInstitutionLogo(course.institutionLogo || getStoredInstitution().logoUrl || '');
    setDepartment(
      course.department || getStoredInstitution().department || 'Department of Computer Science & Software Engineering'
    );
    setProgramme(course.programme || '');
    setAccreditationFramework(course.accreditationFramework || 'Washington Accord (IEA WA-ENG)');
    setInstructorName(course.instructorName || '');
    setCourseCoordinator(course.courseCoordinator || '');
    setPassingBenchmark(course.passingBenchmark || 60);
    setAcademicYear(course.academicYear || '2025–2026');
    setSemester(course.semester || 'Semester I');
    setDossierColorTheme(
      course.dossierColorTheme || getStoredInstitution().defaultDossierColorTheme || 'navy'
    );
    setDossierPrimaryColor(
      course.dossierPrimaryColor || getStoredInstitution().defaultDossierPrimaryColor || ''
    );
    setDossierAccentColor(
      course.dossierAccentColor || getStoredInstitution().defaultDossierAccentColor || ''
    );
  }, [isOpen, course]);

  if (!isOpen) return null;

  const activePreset = DOSSIER_THEME_PRESETS.find((p) => p.id === dossierColorTheme);
  const effectivePrimary = dossierPrimaryColor || activePreset?.primaryHex || '#0f172a';
  const effectiveAccent = dossierAccentColor || activePreset?.accentHex || '#312e81';

  const handleSave = () => {
    const updated: Course = {
      ...course,
      institutionName: institutionName.trim() || undefined,
      institutionLogo: institutionLogo.trim() || undefined,
      department: department.trim() || undefined,
      programme: programme.trim() || course.programme,
      accreditationFramework: accreditationFramework.trim() || course.accreditationFramework,
      dossierColorTheme,
      dossierPrimaryColor: dossierPrimaryColor.trim() || undefined,
      dossierAccentColor: dossierAccentColor.trim() || undefined,
      instructorName: instructorName.trim() || undefined,
      courseCoordinator: courseCoordinator.trim() || undefined,
      passingBenchmark: Number(passingBenchmark) || 60,
      academicYear: academicYear.trim() || course.academicYear,
      semester: semester.trim() || course.semester,
    };

    onSave(updated);

    if (syncToAllCourses) {
      try {
        const stored = getStoredInstitution();
        saveStoredInstitution({
          ...stored,
          name: institutionName.trim() || stored.name,
          logoUrl: institutionLogo.trim() || stored.logoUrl,
          department: department.trim() || stored.department,
          defaultDossierColorTheme: dossierColorTheme,
          defaultDossierPrimaryColor: dossierPrimaryColor.trim() || undefined,
          defaultDossierAccentColor: dossierAccentColor.trim() || undefined,
        });
      } catch (e) {
        console.warn('Failed to sync to default institution:', e);
      }
    }

    setSaveSuccessNotice(true);
    setTimeout(() => {
      setSaveSuccessNotice(false);
      onClose();
    }, 1000);
  };

  const handleDownloadQuickPdf = () => {
    setIsGeneratingPdf(true);
    try {
      const tempCourse: Course = {
        ...course,
        institutionName,
        institutionLogo,
        department,
        accreditationFramework,
        dossierColorTheme,
        dossierPrimaryColor,
        dossierAccentColor,
      };
      downloadCoursePDF(tempCourse, {
        institutionName,
        institutionLogo,
        departmentName: department,
        accreditationFramework,
        colorTheme: dossierColorTheme as any,
        primaryColor: dossierPrimaryColor,
        accentColor: dossierAccentColor,
      });
    } finally {
      setTimeout(() => setIsGeneratingPdf(false), 800);
    }
  };

  const currentCourseWithPendingSettings: Course = {
    ...course,
    institutionName,
    institutionLogo,
    department,
    accreditationFramework,
    dossierColorTheme,
    dossierPrimaryColor,
    dossierAccentColor,
  };

  return (
    <div
      id="course-settings-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/90">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shadow-2xs">
              <Settings className="w-5 h-5 text-indigo-700" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-900">Course Settings &amp; Branding</h2>
                <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                  {course.code || 'OBE360'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Configure institutional logo, academic department, and accreditation dossier export parameters
              </p>
            </div>
          </div>
          <button
            type="button"
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
            id="course-settings-tab-branding"
            onClick={() => setActiveTab('branding')}
            className={`pb-2.5 px-3.5 font-bold text-xs flex items-center space-x-2 border-b-2 transition cursor-pointer ${
              activeTab === 'branding'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span>Institutional Logo &amp; Identity</span>
            {institutionLogo && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            )}
          </button>

          <button
            type="button"
            id="course-settings-tab-accreditation"
            onClick={() => setActiveTab('accreditation')}
            className={`pb-2.5 px-3.5 font-bold text-xs flex items-center space-x-2 border-b-2 transition cursor-pointer ${
              activeTab === 'accreditation'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Accreditation Framework</span>
          </button>

          <button
            type="button"
            id="course-settings-tab-academic"
            onClick={() => setActiveTab('academic')}
            className={`pb-2.5 px-3.5 font-bold text-xs flex items-center space-x-2 border-b-2 transition cursor-pointer ${
              activeTab === 'academic'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4 text-slate-600" />
            <span>Academic Term &amp; Staff</span>
          </button>

          <button
            type="button"
            id="course-settings-tab-preview"
            onClick={() => setActiveTab('preview')}
            className={`pb-2.5 px-3.5 font-bold text-xs flex items-center space-x-2 border-b-2 transition cursor-pointer ${
              activeTab === 'preview'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-4 h-4 text-emerald-600" />
            <span>Dossier Cover Preview</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 flex-1">
          {saveSuccessNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Course settings &amp; institutional branding saved successfully!</span>
            </div>
          )}

          {/* TAB 1: Institutional Logo & Identity */}
          {activeTab === 'branding' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-indigo-50/60 rounded-xl border border-indigo-100 p-3.5 text-xs text-indigo-900 flex items-start space-x-2.5">
                <Sparkles className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                <div>
                  <div className="font-bold">Official Institutional Dossier Branding</div>
                  <div className="text-[11px] text-indigo-700 mt-0.5">
                    Upload your university, polytechnic, or department seal. It will be printed at the top of the Executive Cover Page, in running headers, and on the formal accreditation compliance endorsement certificate.
                  </div>
                </div>
              </div>

              {/* Logo Uploader */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Institutional Crest / Logo Emblem
                </label>
                <InstitutionalLogoUploader
                  currentLogoUrl={institutionLogo}
                  institutionName={institutionName}
                  onLogoChange={(dataUrl) => setInstitutionLogo(dataUrl)}
                  onClearLogo={() => setInstitutionLogo('')}
                />
              </div>

              {/* Name & Academic Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Institution Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="course-settings-institution-name-input"
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    placeholder="e.g. Apex Institute of Science & Technology"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Printed in large uppercase font on the formal dossier cover page.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Academic Department
                  </label>
                  <input
                    type="text"
                    id="course-settings-department-input"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Department of Computer Science & Software Engineering"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Degree Programme
                  </label>
                  <input
                    type="text"
                    id="course-settings-programme-input"
                    value={programme}
                    onChange={(e) => setProgramme(e.target.value)}
                    placeholder="e.g. Bachelor of Science in Computer Science"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
              </div>

              {/* Dossier PDF Color Theme & Branding Options */}
              <div className="pt-4 border-t border-slate-200">
                <DossierThemeSelector
                  selectedThemeId={dossierColorTheme}
                  customPrimaryColor={dossierPrimaryColor}
                  customAccentColor={dossierAccentColor}
                  institutionName={institutionName}
                  institutionLogo={institutionLogo}
                  departmentName={department}
                  showPreviewCard={true}
                  onThemeSelect={(themeId) => setDossierColorTheme(themeId)}
                  onCustomColorChange={(primary, accent) => {
                    setDossierPrimaryColor(primary);
                    if (accent !== undefined) setDossierAccentColor(accent);
                  }}
                />
              </div>

              {/* Sync default checkbox */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start space-x-2.5">
                <input
                  type="checkbox"
                  id="sync-institution-checkbox"
                  checked={syncToAllCourses}
                  onChange={(e) => setSyncToAllCourses(e.target.checked)}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="sync-institution-checkbox" className="text-xs text-slate-700 cursor-pointer">
                  <span className="font-bold text-slate-900 block">Set as workspace default</span>
                  <span className="text-[11px] text-slate-500">
                    Apply this institutional logo, branding colors, and identity across all newly created courses and exports.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: Accreditation Framework */}
          {activeTab === 'accreditation' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Accreditation Framework Standard
                </label>
                <select
                  value={accreditationFramework}
                  onChange={(e) => setAccreditationFramework(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="Washington Accord (IEA WA-ENG)">Washington Accord (IEA WA-ENG) — Engineering</option>
                  <option value="ABET Computing (CAC Criteria)">ABET Computing (CAC Criteria) — CS &amp; IT</option>
                  <option value="ABET Engineering (EAC Criteria)">ABET Engineering (EAC Criteria) — Engineering</option>
                  <option value="Sydney Accord (IEA SA-ET)">Sydney Accord (IEA SA-ET) — Engineering Technology</option>
                  <option value="Seoul Accord (Computing & IT)">Seoul Accord — Global Computing &amp; Software</option>
                  <option value="European EUR-ACE Framework">European EUR-ACE Framework (ENAEE)</option>
                  <option value="AACSB Business Accreditation">AACSB Business &amp; Management Standards</option>
                  <option value="National HEC OBE Framework">National HEC OBE Framework</option>
                </select>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Defines the PLO graduate attributes, evidence compliance matrix, and rubric criteria in the dossier.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Passing Benchmark Standard (%)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="90"
                    value={passingBenchmark}
                    onChange={(e) => setPassingBenchmark(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Institutional threshold for attainment of Course Learning Outcomes (typically 50% or 60%).
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Academic Year
                  </label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    placeholder="e.g. 2025–2026"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Academic Term & Staff */}
          {activeTab === 'academic' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Lead Instructor / Faculty Lead
                  </label>
                  <input
                    type="text"
                    value={instructorName}
                    onChange={(e) => setInstructorName(e.target.value)}
                    placeholder="e.g. Prof. Shahid Soomro"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Printed in the Instructor column of the Cover Page and Sign-off sheet.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Course Coordinator / Module Lead
                  </label>
                  <input
                    type="text"
                    value={courseCoordinator}
                    onChange={(e) => setCourseCoordinator(e.target.value)}
                    placeholder="e.g. Dr. Eleanor Vance"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Semester / Academic Term
                  </label>
                  <input
                    type="text"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    placeholder="e.g. Fall 2026 or Semester I"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Total Credit Hours
                  </label>
                  <input
                    type="number"
                    value={course.creditHours || 3}
                    disabled
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Calculated from course curriculum structure ({course.theoryHours || 3} Theory + {course.labHours || 0} Lab).
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Live Dossier Cover Preview */}
          {activeTab === 'preview' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Accreditation Dossier Cover Page Simulation
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Live visual representation of the PDF cover page with your institutional branding
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadQuickPdf}
                    disabled={isGeneratingPdf}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{isGeneratingPdf ? 'Compiling...' : 'Download PDF'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNestedPreviewOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs shadow-indigo-300"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Open Live PDF Viewer</span>
                  </button>
                </div>
              </div>

              {/* Theme Quick Bar */}
              <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <div className="flex items-center space-x-2">
                  <Palette className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="font-bold text-slate-700">Preview Palette:</span>
                  <span
                    className="w-3 h-3 rounded-full border border-black/10 inline-block shadow-2xs"
                    style={{ backgroundColor: effectivePrimary }}
                  />
                  <span className="font-mono text-[11px] font-bold text-slate-800">{effectivePrimary.toUpperCase()}</span>
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block shadow-2xs"
                    style={{ backgroundColor: effectiveAccent }}
                  />
                  <span className="font-mono text-[10px] text-slate-500">{effectiveAccent.toUpperCase()}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('branding')}
                  className="text-indigo-600 hover:text-indigo-800 text-[11px] font-bold hover:underline cursor-pointer"
                >
                  Adjust Theme Colors →
                </button>
              </div>

              {/* Simulated A4 Page */}
              <div
                className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 space-y-4 text-center transition-all duration-200"
                style={{
                  border: `2px solid ${effectivePrimary}40`,
                  boxShadow: `0 10px 25px -5px ${effectivePrimary}20`,
                }}
              >
                {/* Double Border Simulation */}
                <div
                  className="rounded p-4 space-y-3 transition-colors duration-200"
                  style={{ border: `1.5px solid ${effectivePrimary}50` }}
                >
                  {/* Institutional Logo */}
                  {institutionLogo ? (
                    <div className="w-14 h-14 mx-auto flex items-center justify-center">
                      <img
                        src={institutionLogo}
                        alt="Institutional Seal"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                      <Building2 className="w-6 h-6 text-slate-300" />
                    </div>
                  )}

                  {/* Institution Name */}
                  <div
                    className="text-xs font-black uppercase tracking-wider transition-colors"
                    style={{ color: effectivePrimary }}
                  >
                    {institutionName.toUpperCase()}
                  </div>

                  {/* Department */}
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                    {department.toUpperCase()}
                  </div>

                  <div
                    className="w-24 h-0.5 mx-auto rounded-full"
                    style={{
                      background: `linear-gradient(to right, transparent, ${effectiveAccent}, transparent)`,
                    }}
                  />

                  {/* Badge */}
                  <div
                    className="inline-block px-3 py-0.5 text-white text-[9px] font-bold rounded-xs tracking-wider shadow-2xs transition-colors"
                    style={{ backgroundColor: effectiveAccent }}
                  >
                    OFFICIAL ACCREDITATION DOSSIER • 2026.1 EDITION
                  </div>

                  {/* Course Code & Title */}
                  <div className="pt-2">
                    <div
                      className="text-lg font-black font-mono tracking-tight"
                      style={{ color: effectivePrimary }}
                    >
                      {course.code || 'COURSE CODE'}
                    </div>
                    <div className="text-xs font-bold text-slate-800 line-clamp-2 mt-0.5">
                      {course.title || 'Course Curriculum Specification'}
                    </div>
                  </div>

                  {/* Meta box simulation */}
                  <div
                    className="bg-slate-50/80 rounded p-2.5 text-left text-[9px] space-y-1 mt-2 border"
                    style={{ borderColor: effectivePrimary + '25' }}
                  >
                    <div className="flex justify-between">
                      <span className="text-slate-400 uppercase font-semibold">Standard:</span>
                      <span className="font-bold text-slate-700 truncate max-w-[180px]">{accreditationFramework}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 uppercase font-semibold">Programme:</span>
                      <span className="font-bold text-slate-700 truncate max-w-[180px]">{programme || 'Undergraduate'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 uppercase font-semibold">Credits:</span>
                      <span className="font-bold text-slate-700">{course.creditHours || 3} Credits</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-sm shadow-indigo-300 flex items-center space-x-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Course Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Nested PDF Live Preview Modal if opened from tab */}
      {nestedPreviewOpen && (
        <PDFPreviewModal
          isOpen={nestedPreviewOpen}
          onClose={() => setNestedPreviewOpen(false)}
          course={currentCourseWithPendingSettings}
          initialOptions={{
            institutionName,
            institutionLogo,
            departmentName: department,
            accreditationFramework,
          }}
        />
      )}
    </div>
  );
};
