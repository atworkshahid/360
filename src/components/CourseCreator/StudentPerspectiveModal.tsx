import React, { useState, useMemo } from 'react';
import {
  X,
  BookOpen,
  Target,
  Award,
  Calendar,
  GraduationCap,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Download,
  FileCode,
  QrCode,
  Layers,
  Clock,
} from 'lucide-react';
import { Course } from '../../types';
import { MicroCredentialService } from '../../utils/microCredentialService';
import { MicroCredentialBadgeCard } from '../MicroCredentials/MicroCredentialBadgeCard';
import { DEFAULT_INSTITUTION } from '../../data/institutionData';

interface StudentPerspectiveModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
}

export const StudentPerspectiveModal: React.FC<StudentPerspectiveModalProps> = ({
  course,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'syllabus' | 'transcript'>('transcript');

  // Generate visual micro-credential badges for each masterable skill in the course
  const badges = useMemo(() => {
    return MicroCredentialService.generateCourseMicroCredentials(course);
  }, [course]);

  if (!isOpen) return null;

  const institutionName = course.institutionName || DEFAULT_INSTITUTION.name;
  const departmentName = course.department || 'Faculty of Engineering & Computer Science';

  const handlePrintTranscript = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95">
        {/* Sticky Top Header Bar */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
              <GraduationCap className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">Student Portal & Perspective</h2>
              <p className="text-xs text-slate-500">
                {course.code} • {course.title}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* View Switcher: Syllabus vs Academic Transcript */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                type="button"
                id="student-view-transcript-tab"
                onClick={() => setActiveTab('transcript')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center space-x-1.5 ${
                  activeTab === 'transcript'
                    ? 'bg-white text-indigo-700 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>Academic Transcript & Badges</span>
              </button>

              <button
                type="button"
                id="student-view-syllabus-tab"
                onClick={() => setActiveTab('syllabus')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center space-x-1.5 ${
                  activeTab === 'syllabus'
                    ? 'bg-white text-indigo-700 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span>Course Syllabus</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-8 flex-1 bg-slate-50/50">
          {activeTab === 'transcript' ? (
            /* ========================================================= */
            /* TAB 1: OFFICIAL STUDENT TRANSCRIPT & MICRO-CREDENTIALS    */
            /* ========================================================= */
            <div className="space-y-6">
              {/* Transcript Paper Container */}
              <div
                id="student-official-transcript-document"
                className="bg-white border border-slate-300 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden"
              >
                {/* Official Watermark / Academic Seal */}
                <div className="absolute right-6 top-6 opacity-10 pointer-events-none">
                  <ShieldCheck className="w-48 h-48 text-indigo-900" />
                </div>

                {/* Transcript Header Block */}
                <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                      Official Institutional Transcript
                    </span>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-950 mt-1">
                      {institutionName}
                    </h1>
                    <p className="text-xs text-slate-600">{departmentName}</p>
                    <div className="text-xs font-medium text-slate-500 mt-1">
                      Record Type: <strong>Outcome-Based Coursework & Micro-credential Attainment</strong>
                    </div>
                  </div>

                  <div className="text-left sm:text-right text-xs space-y-1">
                    <div className="text-slate-500 font-mono text-[11px]">
                      Student ID: <strong className="text-slate-900 font-mono">STU-2026-88421</strong>
                    </div>
                    <div className="text-slate-500">
                      Term: <strong className="text-slate-900">{course.semester || 'Spring 2026'}</strong>
                    </div>
                    <div className="text-slate-500">
                      Date Issued: <strong className="text-slate-900">{new Date().toLocaleDateString()}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={handlePrintTranscript}
                      className="no-print mt-2 inline-flex items-center space-x-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Transcript</span>
                    </button>
                  </div>
                </div>

                {/* Course Metadata Overview */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Course Code</span>
                    <span className="font-mono font-bold text-slate-900">{course.code}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Course Title</span>
                    <span className="font-semibold text-slate-900 truncate block">{course.title}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Academic Units</span>
                    <span className="font-bold text-slate-900">{course.creditHours} Credits</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Grade & Status</span>
                    <span className="inline-flex items-center space-x-1 text-emerald-700 font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Completed (Mastery)</span>
                    </span>
                  </div>
                </div>

                {/* ========================================================= */}
                {/* MICRO-CREDENTIAL BADGES SECTION (USER REQUIREMENT)        */}
                {/* ========================================================= */}
                <div className="space-y-4 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="p-1 rounded-lg bg-amber-100 text-amber-800">
                          <Award className="w-4 h-4" />
                        </span>
                        <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                          Certified Micro-credential Badges for Masterable Skills
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Digital badge credentials verifying authentic student skill mastery, backed by cryptographic assertion hashes.
                      </p>
                    </div>

                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 shrink-0 self-start sm:self-auto">
                      {badges.length} Skills Certified
                    </span>
                  </div>

                  {/* Badges Visual Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-2">
                    {badges.map((badge) => (
                      <MicroCredentialBadgeCard
                        key={badge.id}
                        badge={badge}
                        size="md"
                        showActions={true}
                      />
                    ))}
                  </div>
                </div>

                {/* Learning Outcomes Attainment Register on Transcript */}
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                    <Target className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Learning Outcomes (CLO) Competency Attainment</span>
                  </h3>

                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold">
                          <th className="p-2.5">CLO Identifier</th>
                          <th className="p-2.5">Outcome Statement</th>
                          <th className="p-2.5">Cognitive Tier</th>
                          <th className="p-2.5">Attainment Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(course.clos || []).map((clo) => (
                          <tr key={clo.id} className="hover:bg-slate-50">
                            <td className="p-2.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                              {clo.code}
                            </td>
                            <td className="p-2.5 text-slate-700 max-w-md">
                              {clo.statement}
                            </td>
                            <td className="p-2.5 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                                {clo.bloomLevel}
                              </span>
                            </td>
                            <td className="p-2.5 whitespace-nowrap">
                              <span className="inline-flex items-center space-x-1 text-emerald-700 font-semibold">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Mastered (≥80%)</span>
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Academic Sign-off / Registrar Verification */}
                <div className="pt-6 border-t-2 border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500">
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900">Office of the University Registrar</div>
                    <div>Outcome-Based Education Digital Verification Protocol</div>
                    <div className="text-[10px] font-mono text-slate-400">
                      Standard: Open Badges 2.0 / 3.0 W3C Verifiable Credentials
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-right">
                    <div className="w-12 h-12 border border-slate-200 rounded-lg p-1 bg-slate-50 flex items-center justify-center">
                      <QrCode className="w-9 h-9 text-slate-700" />
                    </div>
                    <div className="text-left text-[10px]">
                      <div className="font-bold text-slate-800">Scan to Verify</div>
                      <div className="font-mono text-slate-400">hash: {badges[0]?.verificationHash || '0x4A8F...'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================= */
            /* TAB 2: COURSE SYLLABUS & OVERVIEW                         */
            /* ========================================================= */
            <div className="space-y-6">
              {/* Header Card */}
              <header className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-2xl shadow-sm">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 mb-2 inline-block">
                  Student Syllabus
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">{course.title}</h1>
                <p className="text-indigo-200 text-sm">
                  {course.code} • {course.creditHours} Credits • {course.deliveryMode || 'In-Person'}
                </p>
              </header>

              {/* Description */}
              <section className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>Course Description & Overview</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {course.description || 'No course overview description provided.'}
                </p>
              </section>

              {/* Learning Outcomes */}
              <section className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-600" />
                  <span>Expected Learning Outcomes (CLOs)</span>
                </h3>
                <div className="space-y-2">
                  {(course.clos || []).map((clo, i) => (
                    <div
                      key={i}
                      className="p-3 bg-slate-50/70 rounded-xl border border-slate-200 flex items-start space-x-3 text-xs"
                    >
                      <span className="font-mono font-bold text-indigo-900 bg-indigo-100 px-2 py-0.5 rounded shrink-0">
                        {clo.code}
                      </span>
                      <div className="space-y-1">
                        <p className="text-slate-800 font-normal leading-relaxed">{clo.statement}</p>
                        <div className="flex items-center space-x-2 text-[10px] text-slate-500">
                          {clo.bloomVerb && <span>Verb: <strong>{clo.bloomVerb}</strong></span>}
                          {clo.competency && <span>• Competency: <strong>{clo.competency}</strong></span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Assessments Schedule */}
              <section className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>Graded Assessments & Evaluation Schedule</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(course.assessments || []).map((asmt, i) => (
                    <div key={i} className="p-3.5 border border-slate-200 rounded-xl bg-slate-50/50 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900">{asmt.title}</h4>
                        <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold text-[10px]">
                          {asmt.weightage}% Weight
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px]">{asmt.type} • Pass Mark: {asmt.passingMarks ?? 50}%</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
