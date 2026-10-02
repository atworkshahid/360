import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Download,
  GraduationCap,
  Layers,
  FileCheck,
  BarChart3,
  BookOpen,
  Cpu,
  Clock,
  DollarSign,
  Users,
  Check,
  X,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  ChevronRight,
  Star,
  Award,
  Zap,
  Globe,
  RefreshCw,
  Sliders,
  Building,
  FileText,
  Lock,
  Activity as ActivityIcon,
  Laptop,
  Video,
  Lightbulb,
  CheckSquare,
  Play,
} from 'lucide-react';
import { submitInstitutionalLead } from '../services/leadService';
import { MentiseraLogo } from './Logo';

interface MarketingLandingPageProps {
  onLaunchApp: () => void;
  onOpenCourse?: (courseId?: string) => void;
}

export const MarketingLandingPage: React.FC<MarketingLandingPageProps> = ({
  onLaunchApp,
  onOpenCourse,
}) => {
  // Interactive ROI Calculator State
  const [facultyCount, setFacultyCount] = useState<number>(45);
  const [coursesPerYear, setCoursesPerYear] = useState<number>(120);

  // Active Feature Tab in Interactive Tour
  const [activeTab, setActiveTab] = useState<
    'workflow' | 'tla' | 'copilot' | 'audit' | 'lms' | 'dossier' | 'cqi'
  >('workflow');

  // Dual Workflow View in Architecture Section
  const [marketingWorkflowMode, setMarketingWorkflowMode] = useState<'obe10' | 'granular15'>('obe10');

  // Filter for Interactive TLA Catalog Preview
  const [selectedTlaFilter, setSelectedTlaFilter] = useState<string>('All');

  // Contact / Demo Modal State
  const [demoModalOpen, setDemoModalOpen] = useState<boolean>(false);
  const [demoFormSubmitted, setDemoFormSubmitted] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    fullName: '',
    institution: '',
    designation: '',
    email: '',
    phone: '',
    accreditationTarget: 'Washington Accord / ABET',
    message: '',
  });

  // ROI Math
  const traditionalHoursPerCourse = 65; // Traditional syllabus, mapping, rubrics, CQI paperwork
  const obe360HoursPerCourse = 3.5; // With OBE360 guided steps and AI assistance
  const hoursSavedPerCourse = traditionalHoursPerCourse - obe360HoursPerCourse;
  const totalHoursSavedAnnual = coursesPerYear * hoursSavedPerCourse;
  const avgHourlyCost = 40; // USD equivalent faculty cost
  const annualSavingsUsd = Math.round(totalHoursSavedAnnual * avgHourlyCost);
  const annualSavingsPkr = (annualSavingsUsd * 280).toLocaleString();

  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitInstitutionalLead({
        fullName: formData.fullName,
        institution: formData.institution,
        role: formData.designation,
        email: formData.email,
        phone: formData.phone,
        frameworkInterest: formData.accreditationTarget,
        message: formData.message,
        source: 'marketing_page_modal',
      });
    } catch (err) {
      console.warn('Failed to submit institutional lead:', err);
    }
    setDemoFormSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Academic Announcement Banner */}
      <div className="bg-slate-900 text-slate-100 text-xs py-2.5 px-4 text-center font-medium flex items-center justify-center space-x-2 border-b border-slate-800">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider">
          Enterprise Release v2.6
        </span>
        <span className="text-slate-300 text-[11px] sm:text-xs">
          <strong>MENTISERA OBE360™</strong> — Dual-Engine Curriculum Wizard (10-Step OBE &amp; 15-Step Granular), Active Learning Engagement Meter &amp; Automated ABET/Washington Accord Dossiers.
        </span>
        <button
          onClick={onLaunchApp}
          className="hidden sm:inline-flex items-center space-x-1 text-indigo-400 font-bold hover:text-indigo-300 ml-2 cursor-pointer"
        >
          <span>Launch Live App</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Navigation Header (Clean Academic Light) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MentiseraLogo
              size="md"
              showText={true}
              showTagline={true}
              taglineText="Outcome-Based Education & Accreditation Engine"
              badgeText="HIGHER ED"
            />
          </div>

          <nav className="hidden lg:flex items-center space-x-7 text-xs font-semibold text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition">
              Core Capabilities
            </a>
            <a href="#pedagogy" className="hover:text-indigo-600 transition">
              Active Learning &amp; TLAs
            </a>
            <a href="#workflow" className="hover:text-indigo-600 transition">
              Dual Workflows
            </a>
            <a href="#accreditation" className="hover:text-indigo-600 transition">
              Accreditation Standards
            </a>
            <a href="#roi" className="hover:text-indigo-600 transition">
              Faculty ROI Calculator
            </a>
            <a href="#lms" className="hover:text-indigo-600 transition">
              LMS Connectors
            </a>
            <a href="#pricing" className="hover:text-indigo-600 transition">
              Licensing
            </a>
            <a href="#contact" className="hover:text-indigo-600 transition">
              Contact
            </a>
          </nav>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open_signin_modal'))}
              className="hidden md:inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-indigo-700 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
              title="Sign in with institutional faculty or reviewer credentials"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => setDemoModalOpen(true)}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-indigo-700 hover:bg-slate-100 border border-slate-300 transition cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-indigo-600" />
              <span>Book Campus Demo</span>
            </button>
            <button
              onClick={onLaunchApp}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/30 transition cursor-pointer"
            >
              <span>Enter Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION - Academic Executive Tone */}
      <section className="relative overflow-hidden pt-14 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-white via-indigo-50/30 to-slate-50 border-b border-slate-200">
        {/* Subtle decorative grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.07] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white border border-indigo-200 text-indigo-800 text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Designed for Deans, Program Directors &amp; Accreditation Steering Committees</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-serif tracking-tight text-slate-900 leading-[1.15]">
              Eliminate Accreditation Anxiety.
              <br />
              <span className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-sky-700 bg-clip-text text-transparent">
                Engineer Audit-Proof OBE Curricula in 45 Minutes.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal">
              The premier Outcome-Based Education platform built strictly on <strong>Biggs' Constructive Alignment</strong>. Guarantee mathematical correlation between Course Learning Outcomes (CLOs), weekly <strong>Teaching &amp; Learning Activities (TLAs)</strong>, and criterion rubrics — with an automated <strong>Active Learning Engagement Meter</strong>, granular 15-week lesson scheduler, 1-click <strong>ABET, Washington Accord &amp; HEC dossiers</strong>, and instant <strong>IMS Common Cartridge</strong> export.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={onLaunchApp}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/30 flex items-center justify-center space-x-2 transition cursor-pointer"
              >
                <span>Launch OBE Course Designer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDemoModalOpen(true)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold text-sm flex items-center justify-center space-x-2 shadow-2xs transition cursor-pointer"
              >
                <Phone className="w-4 h-4 text-indigo-600" />
                <span>Schedule Institutional Presentation</span>
              </button>
            </div>

            {/* Institutional Impact Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 border-t border-slate-200/80 max-w-4xl mx-auto">
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <div className="text-3xl font-extrabold text-indigo-600">96%</div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">Faculty Preparation Time Saved</div>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <div className="text-3xl font-extrabold text-emerald-600">≥50%</div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">Active Learning Engagement Guarantee</div>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <div className="text-3xl font-extrabold text-sky-600">Dual-Mode</div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">10-Step OBE &amp; 15-Step Granular</div>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <div className="text-3xl font-extrabold text-purple-600">100%</div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">Audit-Proof Construct Alignment</div>
              </div>
            </div>
          </div>

          {/* Academic Software Preview Showcase Frame */}
          <div className="mt-14 max-w-6xl mx-auto rounded-2xl p-2 bg-gradient-to-b from-slate-200 via-indigo-100 to-slate-200 border border-slate-300 shadow-xl">
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
              {/* Window Chrome */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs text-slate-500">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-slate-300" />
                  <div className="w-3 h-3 rounded-full bg-slate-300" />
                  <div className="w-3 h-3 rounded-full bg-slate-300" />
                  <span className="ml-2 font-mono text-[11px] text-slate-600 font-medium">
                    mentisera.pk/obe360/curriculum-editor/CS-301
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="flex items-center space-x-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-[11px] font-bold border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Constructive Alignment Audit: 98% (Exemplary)</span>
                  </span>
                  <button
                    onClick={onLaunchApp}
                    className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] transition cursor-pointer"
                  >
                    Open Live
                  </button>
                </div>
              </div>

              {/* Four-Column Product Highlight Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
                {/* Card 1: Constructive Alignment */}
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider">
                      Biggs' Triad
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                      ABET C3
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 rounded-lg bg-white border border-slate-200">
                      <div className="flex justify-between font-bold text-slate-800 text-[11px]">
                        <span>CLO 1: Formulate Relational Schema</span>
                        <span className="text-indigo-600 font-mono text-[10px]">Bloom C6</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        PLO 2 (Problem Analysis - Level 3)
                      </div>
                      <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                        Evidence: Midterm (25%) + Capstone (20%)
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-slate-200">
                      <div className="flex justify-between font-bold text-slate-800 text-[11px]">
                        <span>CLO 2: Optimize Indexing</span>
                        <span className="text-indigo-600 font-mono text-[10px]">Bloom C5</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        PLO 3 (Design Solutions - Level 3)
                      </div>
                      <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                        Evidence: Comprehensive Final (40%)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2: Active Learning & TLA Studio */}
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                      Teaching Activities
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                      65% Active
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-800">Engagement Meter</span>
                      <span className="text-emerald-700 font-bold">Compliant (≥50%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                      <div className="bg-emerald-500 h-full w-[65%]" title="Active Learning (65%)" />
                      <div className="bg-slate-300 h-full w-[35%]" title="Direct Lecture (35%)" />
                    </div>
                    <div className="space-y-1 pt-1 text-[10px] text-slate-600">
                      <div className="flex items-center justify-between">
                        <span>• Problem-Based Studio (PBL)</span>
                        <span className="font-mono text-slate-500">90 mins</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>• Bench Lab &amp; Verification</span>
                        <span className="font-mono text-slate-500">120 mins</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>• Socratic Ethics Seminar</span>
                        <span className="font-mono text-slate-500">60 mins</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 3: Granular 15-Week Lesson Creator */}
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                      Lesson Creator
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 font-bold">
                      15 Weeks
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-800">MLO Coverage</span>
                      <span className="text-emerald-700 font-bold">100% (0 Orphaned)</span>
                    </div>
                    <div className="space-y-1 text-[10px] pt-0.5">
                      <div className="p-1.5 rounded bg-slate-50 border border-slate-100">
                        <span className="font-bold text-slate-800 block">W3: Indexing Architectures</span>
                        <span className="text-indigo-600 font-medium">Modality: Flipped Studio</span>
                      </div>
                      <div className="p-1.5 rounded bg-slate-50 border border-slate-100">
                        <span className="font-bold text-slate-800 block">W7: Query Optimizer Lab</span>
                        <span className="text-indigo-600 font-medium">Modality: Hands-on Lab</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 4: LMS & Accreditation Export */}
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                      Accreditation &amp; LMS
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 font-bold">
                      Direct Deploy
                    </span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between p-1.5 rounded bg-white border border-slate-200 text-[10px]">
                      <span className="font-medium text-slate-800">IMS Common Cartridge</span>
                      <span className="text-emerald-700 font-bold">.imscc</span>
                    </div>
                    <div className="flex items-center justify-between p-1.5 rounded bg-white border border-slate-200 text-[10px]">
                      <span className="font-medium text-slate-800">Moodle Competency</span>
                      <span className="text-emerald-700 font-bold">CSV</span>
                    </div>
                    <div className="flex items-center justify-between p-1.5 rounded bg-white border border-slate-200 text-[10px]">
                      <span className="font-medium text-slate-800">Blackboard Rubrics</span>
                      <span className="text-emerald-700 font-bold">XML</span>
                    </div>
                    <div className="flex items-center justify-between p-1.5 rounded bg-white border border-slate-200 text-[10px]">
                      <span className="font-medium text-slate-800">ABET &amp; HEC Dossier</span>
                      <span className="text-indigo-700 font-bold">1-Click</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ACCREDITATION LOGOS BAR */}
      <section id="accreditation" className="border-b border-slate-200 bg-white py-9">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">
            Guaranteed Architectural Compliance Across Global Quality Assurance Accords &amp; Councils
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-semibold text-slate-700">
            <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>Washington Accord (IEA WA1–WA12)</span>
            </div>
            <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>ABET (EAC / CAC Criteria 3 &amp; 4)</span>
            </div>
            <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200">
              <Award className="w-4 h-4 text-sky-600" />
              <span>National Board of Accreditation (NBA Tier I/II)</span>
            </div>
            <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200">
              <Award className="w-4 h-4 text-purple-600" />
              <span>Higher Education Commission (HEC Policy 2023)</span>
            </div>
            <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200">
              <Award className="w-4 h-4 text-amber-600" />
              <span>Sydney &amp; Seoul Accords</span>
            </div>
          </div>
        </div>
      </section>

      {/* PAIN VS SOLUTION: WHY ACCREDITATION PREPARATION IS BROKEN */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <h2 className="text-xs font-bold text-indigo-700 uppercase tracking-widest">
            Institutional Reality Check
          </h2>
          <h3 className="text-2xl sm:text-4xl font-bold font-serif text-slate-900">
            Why Traditional Accreditation Preparation Paralyzes Faculty
          </h3>
          <p className="text-sm text-slate-600">
            Higher education institutions spend an average of 450+ faculty hours per semester manually compiling course folders, recalculating correlation percentages, and formatting Word tables.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pain Column */}
          <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700 font-bold">
                <X className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-base text-rose-900">The Fragmented Spreadsheet Nightmare</h4>
                <p className="text-xs text-rose-700/80">What faculty and department chairs endure each cycle</p>
              </div>
            </div>

            <ul className="space-y-3.5 text-xs text-slate-700">
              <li className="flex items-start space-x-3">
                <span className="text-rose-600 font-bold shrink-0 text-sm">✕</span>
                <span>
                  <strong>Orphaned Learning Outcomes:</strong> CLOs look complete on paper but lack corresponding assessment items or active learning evidence, leading to immediate citations by visiting evaluators.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-rose-600 font-bold shrink-0 text-sm">✕</span>
                <span>
                  <strong>Unmeasurable Bloom's Verbs:</strong> Faculty write *"students will understand concepts"* rather than observable, testable verbs (*"formulate, synthesize, troubleshoot"*).
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-rose-600 font-bold shrink-0 text-sm">✕</span>
                <span>
                  <strong>Weeks of Pre-Visit Panic:</strong> Exhausted faculty spend nights manually verifying spreadsheet formulas, checking credit hour allocations, and reformatting Word tables.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-rose-600 font-bold shrink-0 text-sm">✕</span>
                <span>
                  <strong>LMS Disconnect:</strong> The approved syllabus lives in a static PDF while LMS course sites have unlinked quizzes and inconsistent rubrics.
                </span>
              </li>
            </ul>
          </div>

          {/* Solution Column */}
          <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-base text-emerald-900">The MENTISERA OBE360™ Standard</h4>
                <p className="text-xs text-emerald-700/80">Mathematical alignment and automated quality assurance</p>
              </div>
            </div>

            <ul className="space-y-3.5 text-xs text-slate-700">
              <li className="flex items-start space-x-3">
                <span className="text-emerald-600 font-bold shrink-0 text-sm">✓</span>
                <span>
                  <strong>Real-Time 360° Alignment Auditor:</strong> Continuous construct validation detects gaps instantly and alerts when any outcome falls below the mandatory 70% attainment threshold.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-emerald-600 font-bold shrink-0 text-sm">✓</span>
                <span>
                  <strong>AI OBE Copilot (Gemini-Powered):</strong> Replaces vague pedagogy with rigorous Bloom's taxonomy verbs and drafts analytic 4-tier rubrics in seconds.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-emerald-600 font-bold shrink-0 text-sm">✓</span>
                <span>
                  <strong>1-Click Official Dossiers:</strong> Generate publication-quality ABET, Washington Accord, and HEC dossiers with formal review committee sign-offs.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-emerald-600 font-bold shrink-0 text-sm">✓</span>
                <span>
                  <strong>Universal LMS Deployment:</strong> Export IMS Common Cartridge packages, Moodle Competency CSVs, and Blackboard XML rubrics with zero copy-pasting.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* INTERACTIVE FEATURE SHOWCASE TOUR */}
      <section id="features" className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <h2 className="text-xs font-bold text-indigo-700 uppercase tracking-widest">
              Comprehensive Platform Capabilities
            </h2>
            <h3 className="text-2xl sm:text-4xl font-bold font-serif text-slate-900">
              Engineered for Complete Constructive Alignment
            </h3>
            <p className="text-xs text-slate-600">
              Select a capability below to explore how OBE360 brings rigor, speed, and accuracy to curriculum design.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {[
              { id: 'workflow', label: 'Dual Guided Workflows', icon: Layers },
              { id: 'tla', label: 'Active Learning & TLAs', icon: ActivityIcon },
              { id: 'copilot', label: 'AI OBE Copilot', icon: Sparkles },
              { id: 'audit', label: 'Real-Time Auditor', icon: BarChart3 },
              { id: 'lms', label: 'LMS Interoperability', icon: GraduationCap },
              { id: 'dossier', label: 'Accreditation Dossiers', icon: FileCheck },
              { id: 'cqi', label: 'Continuous Improvement (CQI)', icon: RefreshCw },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Feature Display Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-xs">
            {activeTab === 'workflow' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold uppercase">
                      Dual Curriculum Architecture
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      10-Step Rapid &amp; 15-Step Deep
                    </span>
                  </div>
                  <h4 className="text-2xl font-bold font-serif text-slate-900">
                    Choose Your Workflow Velocity: 10-Step OBE vs. 15-Step Granular
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    OBE360 uniquely provides two purpose-built pathways: an expedited 10-Step workflow for rapid accreditation compliance dossiers, and a granular 15-stage pipeline for deep modular lesson engineering.
                  </p>

                  {/* Dual Mode Switcher */}
                  <div className="flex p-1 bg-slate-200/80 rounded-xl max-w-sm">
                    <button
                      onClick={() => setMarketingWorkflowMode('obe10')}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                        marketingWorkflowMode === 'obe10'
                          ? 'bg-white text-indigo-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      10-Step Rapid OBE
                    </button>
                    <button
                      onClick={() => setMarketingWorkflowMode('granular15')}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                        marketingWorkflowMode === 'granular15'
                          ? 'bg-white text-indigo-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      15-Step Granular
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <div className="font-bold text-slate-900 mb-1">
                        {marketingWorkflowMode === 'obe10' ? 'Stage 01–06: Fast-Track Foundation' : 'Stage 01–06: Deep Construct'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {marketingWorkflowMode === 'obe10'
                          ? 'Identity, purpose, Bloom CLOs, PLO mapping matrix & weekly schedule.'
                          : 'Course blueprint, Bloom CLOs, PLO mapping, module architecture & MLOs.'}
                      </div>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-indigo-200 bg-indigo-50/40">
                      <div className="font-bold text-indigo-950 mb-1 flex items-center justify-between">
                        <span>Stage 07: Pedagogy &amp; Lessons</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-600 text-white font-bold">FEATURED</span>
                      </div>
                      <div className="text-[11px] text-indigo-900">
                        {marketingWorkflowMode === 'obe10'
                          ? 'Teaching & Learning Activities (TLAs), TLA Catalog & Active Learning Meter (≥50% target).'
                          : 'Modular Lesson Creator, 4 delivery modalities & real-time MLO coverage tracking.'}
                      </div>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <div className="font-bold text-slate-900 mb-1">
                        {marketingWorkflowMode === 'obe10' ? 'Stage 08: Assessment Plan' : 'Stages 08–12: Assessment Engineering'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {marketingWorkflowMode === 'obe10'
                          ? 'Direct distribution across 100% total with CLO and Bloom level mapping.'
                          : 'Task designer, question builder, 4-tier rubrics & evidence rules.'}
                      </div>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <div className="font-bold text-slate-900 mb-1">
                        {marketingWorkflowMode === 'obe10' ? 'Stages 09–10: Audit & Export' : 'Stages 13–15: Audit & CQI Export'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Constructive alignment verification, gap auto-remediation & 1-click ABET/LMS dossiers.
                      </div>
                    </div>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={onLaunchApp}
                      className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer"
                    >
                      <span>Launch Course Designer ({marketingWorkflowMode === 'obe10' ? '10-Step' : '15-Step'})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-2.5 font-mono text-xs shadow-2xs">
                  <div className="flex justify-between items-center text-slate-500 pb-2 border-b border-slate-100">
                    <span className="font-bold">
                      {marketingWorkflowMode === 'obe10' ? '10-Step OBE Pipeline' : '15-Step Granular Pipeline'}
                    </span>
                    <span className="text-emerald-700 font-bold">
                      {marketingWorkflowMode === 'obe10' ? '10 / 10 Stages' : '15 / 15 Stages'}
                    </span>
                  </div>
                  <div className="space-y-2 text-[11px]">
                    <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                      <span className="text-slate-800">01. Framework &amp; Identity</span>
                      <span className="text-emerald-700 font-bold">✓ Complete</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                      <span className="text-slate-800">04. CLO Formulation (Bloom C1–C6)</span>
                      <span className="text-emerald-700 font-bold">✓ Measurable Verbs</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                      <span className="text-slate-800">05. Outcome Mapping Matrix</span>
                      <span className="text-emerald-700 font-bold">✓ Weighted PLO 1/2/3</span>
                    </div>
                    {marketingWorkflowMode === 'obe10' ? (
                      <div className="flex items-center justify-between p-2.5 rounded bg-emerald-50 border border-emerald-300">
                        <div>
                          <span className="text-emerald-950 font-bold block">07. Teaching Activities (TLAs)</span>
                          <span className="text-emerald-700 text-[10px] font-sans">Active Learning Meter: 64% (≥50% ABET)</span>
                        </div>
                        <span className="text-emerald-700 font-bold">✓ TLA Catalog</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-2.5 rounded bg-indigo-50 border border-indigo-300">
                        <div>
                          <span className="text-indigo-950 font-bold block">07. Lesson Creator Studio</span>
                          <span className="text-indigo-700 text-[10px] font-sans">15 Weeks • 4 Modalities • 0 Orphan MLOs</span>
                        </div>
                        <span className="text-indigo-700 font-bold">✓ Fully Covered</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                      <span className="text-slate-800">
                        {marketingWorkflowMode === 'obe10' ? '08. Assessment Plan (100%)' : '11. Performance Rubrics'}
                      </span>
                      <span className="text-emerald-700 font-bold">✓ Formative/Summative</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                      <span className="text-slate-800">
                        {marketingWorkflowMode === 'obe10' ? '09. Alignment &amp; Audit Check' : '13. Real-Time OBE Audit'}
                      </span>
                      <span className="text-emerald-700 font-bold">✓ 98% Score (Exemplary)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ACTIVE LEARNING & TEACHING ACTIVITIES (NEW FEATURE) */}
            {activeTab === 'tla' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase">
                      Biggs' Triad In Action
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                      Washington Accord WA1–WA12
                    </span>
                  </div>
                  <h4 className="text-2xl font-bold font-serif text-slate-900">
                    Teaching &amp; Learning Activities (TLAs) &amp; Active Learning Engagement Meter
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Evaluators from ABET and the Washington Accord penalize courses that rely exclusively on passive lectures. OBE360's built-in <strong>TLA Catalog</strong> and <strong>Active Learning Engagement Meter</strong> ensure authentic, student-centered practice with real-time compliance metrics.
                  </p>

                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                      <div className="font-bold text-slate-900 flex items-center justify-between">
                        <span>Active Learning Engagement Meter (≥50% Mandate)</span>
                        <span className="text-emerald-700 font-bold font-mono">68% Active</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Continuously computes the proportion of student-directed problem solving (PBL, laboratory, seminars) against direct passive instruction.
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                      <div className="font-bold text-slate-900">Curated Pedagogical TLA Catalog</div>
                      <p className="text-[11px] text-slate-500">
                        Pre-engineered templates for Problem-Based Learning, Hands-on Bench Labs, Socratic Seminars, Capstone Sprints, and Interactive Case Studies.
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                      <div className="font-bold text-slate-900">Granular 15-Week Lesson Creator</div>
                      <p className="text-[11px] text-slate-500">
                        Track delivery modalities (Synchronous Seminar, Lab Workshop, Flipped Classroom, Asynchronous Prep) and prevent orphaned Module Learning Outcomes.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={onLaunchApp}
                      className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer"
                    >
                      <span>Explore TLA Studio in Live App</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Right Interactive Mockup for TLA */}
                <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-4 shadow-2xs text-xs">
                  {/* Active Learning Gauge */}
                  <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <ActivityIcon className="w-4 h-4 text-emerald-700" />
                        <span className="font-bold text-emerald-950">Active Learning Engagement Meter</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-200/70 text-emerald-900 text-[10px] font-extrabold uppercase">
                        Compliant (≥50%)
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden flex shadow-inner">
                      <div
                        className="bg-emerald-600 h-full w-[68%] transition-all"
                        title="Active Learning: 68% (PBL, Labs, Socratic Seminars)"
                      />
                      <div
                        className="bg-slate-400 h-full w-[32%] transition-all"
                        title="Direct Instruction: 32% (Interactive Lectures)"
                      />
                    </div>

                    <div className="flex justify-between text-[11px] font-medium text-slate-600">
                      <span className="text-emerald-800 font-bold">● Active Learning: 68% (170 min/wk)</span>
                      <span className="text-slate-600">● Direct Lecture: 32% (80 min/wk)</span>
                    </div>
                  </div>

                  {/* Previews of 2 TLA Catalog Items */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Selected High-Impact Pedagogies (Biggs' Alignment)
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">Problem-Based Learning (PBL) Studio</span>
                        <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-mono text-[10px] font-bold">
                          Bloom C4–C6
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Multi-stage engineering challenge where teams dissect ambiguity, formulate schemas, and defend architectures.
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                        <span>Duration: 90 mins</span>
                        <span className="text-emerald-700 font-semibold">Evidence: Architecture Design Memo</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">Hands-on Laboratory &amp; Bench Workout</span>
                        <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 font-mono text-[10px] font-bold">
                          Bloom C3–C5
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Applied verification in sandbox environment with automated test suites and query profiling tools.
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                        <span>Duration: 120 mins</span>
                        <span className="text-emerald-700 font-semibold">Evidence: Tested Git Repo / Log Artifact</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'copilot' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold uppercase">
                    AI Pedagogical Copilot
                  </span>
                  <h4 className="text-2xl font-bold font-serif text-slate-900">
                    OBE Copilot Powered by Google Gemini
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Designed specifically for higher education curriculum engineering. Intercepts vague pedagogical language, suggests precise Bloom's taxonomy verbs, and auto-generates 4-tier rubric matrices for practicals and capstones.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700">
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>Bloom Verb Refiner:</strong> Upgrades low-order verbs into high-order evaluation and creation verbs.</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>Automated Analytic Rubrics:</strong> Instantly drafts descriptors for Exemplary, Proficient, Developing, and Unsatisfactory bands.</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>Workload Heuristics:</strong> Balances weekly student study hours according to Carnegie unit guidelines.</span>
                    </li>
                  </ul>
                  <button
                    onClick={onLaunchApp}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer"
                  >
                    <span>Try Copilot in Course Editor</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-3 font-mono text-xs shadow-2xs">
                  <div className="flex items-center space-x-2 text-indigo-700 font-bold pb-2 border-b border-slate-100">
                    <Sparkles className="w-4 h-4" />
                    <span>Copilot Output Stream</span>
                  </div>
                  <div className="p-3.5 rounded-lg bg-indigo-50/70 border border-indigo-200 text-slate-700 space-y-2 text-[11px]">
                    <div className="text-indigo-900 font-bold">Reviewing CLO 2 for ABET Criterion 3:</div>
                    <p className="text-slate-600 italic">
                      "Original: 'Students will learn database queries.'<br />
                      Recommendation: 'Formulate and optimize complex SQL queries using relational algebra and indexing structures (Bloom C5 - Synthesis).'"
                    </p>
                    <div className="text-emerald-700 font-bold pt-1">
                      → Suggested 4-Tier Assessment Rubric Generated with 3 criteria &amp; 100% weighted breakdown.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'audit' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase">
                    Zero-Risk Quality Assurance
                  </span>
                  <h4 className="text-2xl font-bold font-serif text-slate-900">
                    Real-Time 360° Alignment Auditor &amp; Health Radar
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Prevent surprise citations during accreditation reviews. OBE360 continuously recalculates construct validity as faculty draft their syllabus, validating CLO coverage, Bloom balance, and credit-hour math.
                  </p>
                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <div className="font-bold text-emerald-700">Zero-Orphan CLO Verification</div>
                      <div className="text-slate-500 text-[11px]">Ensures every single learning outcome has at least one direct assessment evidence item.</div>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <div className="font-bold text-amber-700">&lt; 70% Attainment Threshold Alerts</div>
                      <div className="text-slate-500 text-[11px]">Flags at-risk outcomes with low assessment weights before they trigger accreditation non-compliance.</div>
                    </div>
                  </div>
                  <button
                    onClick={onLaunchApp}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer"
                  >
                    <span>View Audit Radar in App</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="bg-white rounded-xl p-6 border border-slate-200 text-center space-y-4 shadow-2xs">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-emerald-500 bg-emerald-50 text-emerald-700 font-extrabold text-3xl shadow-sm">
                    98%
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-sm text-slate-900">Curriculum Health Status: Exemplary</div>
                    <div className="text-xs text-slate-500">All 4 CLOs, 12 Weekly Lessons &amp; 5 Assessments fully aligned</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px] pt-2">
                    <div className="p-2 rounded bg-slate-50 border border-slate-200">
                      <div className="text-slate-500">CLO-PLO Alignment</div>
                      <div className="font-bold text-emerald-700">100%</div>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-slate-200">
                      <div className="text-slate-500">Bloom Spread</div>
                      <div className="font-bold text-emerald-700">Balanced</div>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-slate-200">
                      <div className="text-slate-500">Credit Hours</div>
                      <div className="font-bold text-emerald-700">135 / 135h</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'lms' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold uppercase">
                    Universal LMS Interoperability
                  </span>
                  <h4 className="text-2xl font-bold font-serif text-slate-900">
                    Direct Export for Moodle, Blackboard Learn &amp; Canvas
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Eliminate repetitive manual data entry. OBE360 exports open standards compatible with virtually every major Learning Management System in higher education.
                  </p>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-900 font-semibold">IMS Common Cartridge 1.2/1.3 (.imscc)</span>
                      <span className="text-indigo-700 font-mono text-[11px] font-bold">Standard Cartridge</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-900 font-semibold">Moodle Competency Framework (CSV)</span>
                      <span className="text-emerald-700 font-mono text-[11px] font-bold">Direct Import</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-900 font-semibold">Blackboard Learn Rubrics (XML)</span>
                      <span className="text-amber-700 font-mono text-[11px] font-bold">Grade Center XML</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-900 font-semibold">Canvas Learning Outcomes (CSV)</span>
                      <span className="text-sky-700 font-mono text-[11px] font-bold">Outcomes CSV</span>
                    </div>
                  </div>
                  <button
                    onClick={onLaunchApp}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer"
                  >
                    <span>Test LMS Exporters</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="bg-white rounded-xl p-6 border border-slate-200 space-y-4 shadow-2xs">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Direct API Connectors &amp; LTI 1.3 Advantage
                  </div>
                  <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-900">LMS Connector Status:</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        READY TO DEPLOY
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      Synchronize course shells, modular assignments, and rubrics directly to your campus Moodle or Canvas instance using REST APIs or LTI 1.3 Deep Linking.
                    </p>
                  </div>
                  <div className="text-[11px] text-slate-600 space-y-1">
                    <div>✓ IMS Global Common Cartridge Certified Specifications</div>
                    <div>✓ QTI 2.1 Assessment Blueprint Interoperability</div>
                    <div>✓ Automatic Gradebook Column Provisioning</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'dossier' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase">
                    Accreditation Defense
                  </span>
                  <h4 className="text-2xl font-bold font-serif text-slate-900">
                    1-Click ABET, Washington Accord &amp; HEC Dossiers
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Generate the exact course exhibits requested by visiting evaluation teams. Download publication-quality PDF dossiers with institutional cover pages, Bloom taxonomy breakdown charts, and formatted Word documents (.docx) ready for committee signatures.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <div className="font-bold text-slate-900">Full Course Syllabus</div>
                      <div className="text-slate-500 text-[11px]">Formatted to ABET EAC / CAC criteria.</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <div className="font-bold text-slate-900">CLO-PLO Correlation Matrix</div>
                      <div className="text-slate-500 text-[11px]">Exact weighting and justification notes.</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <div className="font-bold text-slate-900">Analytic Rubric Portfolio</div>
                      <div className="text-slate-500 text-[11px]">Performance benchmarks for all assessments.</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <div className="font-bold text-slate-900">CQI Continuous Review</div>
                      <div className="text-slate-500 text-[11px]">Documented improvement actions from prior cohorts.</div>
                    </div>
                  </div>
                  <button
                    onClick={onLaunchApp}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer"
                  >
                    <span>Download Sample Dossier in App</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="bg-white rounded-xl p-6 border border-slate-200 flex flex-col items-center justify-center space-y-3 text-center shadow-2xs">
                  <div className="w-14 h-14 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700">
                    <FileCheck className="w-7 h-7" />
                  </div>
                  <div className="text-sm font-bold text-slate-900">Official Accreditation Dossier Engine</div>
                  <div className="text-xs text-slate-500 max-w-xs">
                    Export high-resolution PDFs, editable Microsoft Word files, and structured JSON backups with a single click.
                  </div>
                  <div className="w-full pt-3 border-t border-slate-100 flex justify-around text-xs font-semibold text-slate-700">
                    <span>PDF Dossier</span>
                    <span>•</span>
                    <span>Word .docx</span>
                    <span>•</span>
                    <span>Common Cartridge</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'cqi' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase">
                    Closing the Assessment Loop
                  </span>
                  <h4 className="text-2xl font-bold font-serif text-slate-900">
                    Continuous Quality Improvement (CQI) Action Plans
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Satisfy ABET Criterion 4 and HEC OBE Section 6 by capturing semester-over-semester cohort reflections, identifying attainment root causes, and formulating actionable intervention milestones.
                  </p>
                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <div className="font-bold text-slate-900">Cohort Attainment Comparison</div>
                      <div className="text-slate-500 text-[11px]">Compare Fall vs Spring cohort performance across all Course Learning Outcomes.</div>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <div className="font-bold text-slate-900">Action Plan Milestones</div>
                      <div className="text-slate-500 text-[11px]">Assign responsibility and due dates for pedagogical interventions.</div>
                    </div>
                  </div>
                  <button
                    onClick={onLaunchApp}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer"
                  >
                    <span>View CQI Stage in App</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-3 font-mono text-xs shadow-2xs">
                  <div className="flex justify-between items-center text-slate-500 pb-2 border-b border-slate-100">
                    <span className="font-bold">CQI Action Plan Log</span>
                    <span className="text-indigo-700 font-bold">Fall 2025 Cycle</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 text-[11px]">
                    <div className="font-bold text-slate-900">Identified Deficiency in CLO 3:</div>
                    <p className="text-slate-600">Cohort attainment dropped to 64% on SQL optimization practicals.</p>
                    <div className="text-emerald-700 font-bold pt-1">
                      Action Taken: Added 2 weekly hands-on laboratory query-profiling exercises.
                    </div>
                    <div className="text-slate-500 text-[10px] pt-1">Target for Next Cycle: 75% cohort attainment.</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* DEDICATED PEDAGOGICAL ENGINEERING & ACTIVE LEARNING SECTION (NEW FEATURE) */}
      <section id="pedagogy" className="py-20 bg-gradient-to-b from-slate-50 via-white to-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              <ActivityIcon className="w-3.5 h-3.5 text-emerald-700" />
              <span>Biggs' Constructive Alignment in Practice</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold font-serif text-slate-900">
              Active Learning &amp; Pedagogical Engineering
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Washington Accord and ABET Criterion 5 evaluators actively penalize courses that rely exclusively on one-way lectures. OBE360 introduces an automated <strong>Active Learning Engagement Meter</strong>, a <strong>Curated TLA Catalog</strong>, and a <strong>Granular 15-Week Lesson Creator</strong> to guarantee high-impact, student-centered learning.
            </p>
          </div>

          {/* 3 Pillars of Pedagogical Innovation */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-14">
            {/* Pillar 1: Active Learning Meter */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold">
                  <ActivityIcon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-slate-900">Active Learning Engagement Meter</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Real-time ratio computation comparing active student problem solving against passive lecture minutes. Immediately validates courses against the Washington Accord ≥50% active learning mandate.
                </p>
              </div>

              {/* Gauge Graphic */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800">Live Course Ratio:</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold font-mono text-[11px]">
                    67.8% ACTIVE
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden flex">
                  <div className="bg-emerald-600 h-full w-[68%]" />
                  <div className="bg-slate-400 h-full w-[32%]" />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                  <span className="text-emerald-700 font-bold">Active: 30.5 hrs</span>
                  <span>Threshold: ≥50%</span>
                  <span>Lecture: 14.5 hrs</span>
                </div>
                <div className="pt-1 text-[10px] text-emerald-700 font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Accreditation Ready: Exceeds Washington Accord Benchmark</span>
                </div>
              </div>
            </div>

            {/* Pillar 2: Pedagogical TLA Catalog */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-slate-900">Curated Pedagogical TLA Catalog</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Eliminate guesswork for faculty. Access verified pedagogical templates mapped to Bloom's Taxonomy (C1–C6) with exact time allocations, student deliverables, and assessment evidence rules.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                  <span className="font-bold text-slate-800">Pre-Engineered Templates:</span>
                  <span className="text-indigo-600 font-bold font-mono text-[11px]">12+ Models</span>
                </div>
                <div className="text-[11px] text-slate-600 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span>• Problem-Based Learning Studio</span>
                    <span className="font-mono text-slate-500">Bloom C4–C6</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>• Hands-on Bench Laboratory</span>
                    <span className="font-mono text-slate-500">Bloom C3–C5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>• Socratic Ethics Seminar</span>
                    <span className="font-mono text-slate-500">Bloom C4–C5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>• Capstone Design Sprint &amp; Bench</span>
                    <span className="font-mono text-slate-500">Bloom C5–C6</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pillar 3: Granular Lesson Creator */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700 font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-slate-900">Granular 15-Week Lesson Creator</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Design week-by-week instructional lessons with 4 delivery modalities, real-time MLO coverage tracking to eliminate orphaned learning outcomes, and automated Carnegie workload balancing.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">4 Delivery Modalities:</span>
                  <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold text-[10px]">Zero Orphan MLOs</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <div className="p-1.5 rounded bg-white border border-slate-200 font-semibold text-slate-700">
                    Interactive Seminar
                  </div>
                  <div className="p-1.5 rounded bg-white border border-slate-200 font-semibold text-slate-700">
                    Hands-on Lab
                  </div>
                  <div className="p-1.5 rounded bg-white border border-slate-200 font-semibold text-slate-700">
                    Flipped Classroom
                  </div>
                  <div className="p-1.5 rounded bg-white border border-slate-200 font-semibold text-slate-700">
                    Asynchronous Prep
                  </div>
                </div>
                <div className="pt-1 text-[10px] text-slate-500 flex justify-between">
                  <span>Student Effort: 135 Contact &amp; Prep Hours</span>
                  <span className="text-emerald-700 font-bold">100% Balanced</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive TLA Catalog Showcase Browser */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Interactive Pedagogical TLA Catalog</h3>
                <p className="text-xs text-slate-500">Explore pre-configured teaching activity templates available in Step 07.</p>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap gap-1.5">
                {['All', 'Active Learning', 'Authentic Practice', 'Collaborative', 'Direct Instruction'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedTlaFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      selectedTlaFilter === cat
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
              {[
                {
                  name: 'Problem-Based Learning (PBL) Studio',
                  category: 'Active Learning',
                  bloom: 'Bloom C4–C6',
                  duration: '90 mins',
                  description: 'Authentic engineering scenario where student teams synthesize requirements, formulate data schemas, and resolve real-world trade-offs.',
                  deliverable: 'Architecture Blueprint & Trade-off Matrix',
                  active: true,
                },
                {
                  name: 'Hands-on Laboratory & Bench Workout',
                  category: 'Authentic Practice',
                  bloom: 'Bloom C3–C5',
                  duration: '120 mins',
                  description: 'Guided sandbox experimentation with unit tests, hardware logic verification, and performance profiling scripts.',
                  deliverable: 'Automated Test Pass Log & Git Repository',
                  active: true,
                },
                {
                  name: 'Socratic Seminar & Policy Deconstruction',
                  category: 'Collaborative',
                  bloom: 'Bloom C4–C5',
                  duration: '60 mins',
                  description: 'Dialogue-driven investigation into technological ethics, safety regulations, intellectual property, and institutional governance.',
                  deliverable: 'Structured Debate Synthesis Memo',
                  active: true,
                },
                {
                  name: 'Capstone Design Sprint & Peer Review Bench',
                  category: 'Collaborative',
                  bloom: 'Bloom C5–C6',
                  duration: '120 mins',
                  description: 'Iterative sprint review where cross-functional student squads critique design prototypes against ABET rubrics.',
                  deliverable: 'Sprint Milestone Demo & Peer Review Log',
                  active: true,
                },
                {
                  name: 'Interactive Lecture with Formative Polling',
                  category: 'Direct Instruction',
                  bloom: 'Bloom C1–C2',
                  duration: '50 mins',
                  description: 'Focused conceptual lecture interspersed with 3 real-time diagnostic concept checks and exit ticket questions.',
                  deliverable: 'Live Diagnostic Poll Response Data',
                  active: false,
                },
                {
                  name: 'Industrial Case Study Comparative Analysis',
                  category: 'Authentic Practice',
                  bloom: 'Bloom C4–C5',
                  duration: '75 mins',
                  description: 'Deep retrospective into real-world catastrophic failure or enterprise migration, examining root cause and preventive architecture.',
                  deliverable: 'Executive Root-Cause Investigation Memo',
                  active: true,
                },
              ]
                .filter((item) => selectedTlaFilter === 'All' || item.category === selectedTlaFilter)
                .map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-indigo-300 hover:shadow-xs transition space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 font-bold uppercase">
                          {item.category}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-mono font-bold">
                          {item.bloom}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 leading-snug">{item.name}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 space-y-1 text-[11px]">
                      <div className="flex justify-between text-slate-500">
                        <span>Duration: <strong>{item.duration}</strong></span>
                        <span className={item.active ? 'text-emerald-700 font-bold' : 'text-slate-600 font-medium'}>
                          {item.active ? '● Active Task' : '○ Direct Instruction'}
                        </span>
                      </div>
                      <div className="text-slate-700">
                        <span className="font-semibold text-indigo-900">Deliverable:</span> {item.deliverable}
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                All templates include automated credit-hour computation and Biggs' alignment verification.
              </div>
              <button
                onClick={onLaunchApp}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-2 transition cursor-pointer"
              >
                <span>Use TLA Templates in Your Course</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* DEDICATED DUAL WORKFLOWS ARCHITECTURE SECTION (NEW FEATURE) */}
      <section id="workflow" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-indigo-700" />
              <span>Dual-Engine Curriculum Architecture</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold font-serif text-slate-900">
              Two Tailored Pathways. Zero Compromise on Rigor.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Different institutional scenarios require different workflows. Rapid accreditation cycles need fast-track blueprints, while comprehensive semester curriculum rollouts require week-by-week modular lesson design.
            </p>

            {/* Workflow Mode Selector Buttons */}
            <div className="flex justify-center pt-3">
              <div className="inline-flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                <button
                  onClick={() => setMarketingWorkflowMode('obe10')}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    marketingWorkflowMode === 'obe10'
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  OBE 10-Step Rapid Blueprint (45 mins)
                </button>
                <button
                  onClick={() => setMarketingWorkflowMode('granular15')}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    marketingWorkflowMode === 'granular15'
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Granular 15-Step Deep Engineering (15 Weeks)
                </button>
              </div>
            </div>
          </div>

          {/* Workflow Pipeline Display */}
          {marketingWorkflowMode === 'obe10' ? (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-emerald-950 block text-sm">
                    OBE 10-Step Fast-Track Accreditation Pathway
                  </span>
                  <span className="text-emerald-800">
                    Engineered for accreditation self-study reports (SSR), syllabus approval boards, and rapid curriculum compliance.
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold font-mono text-[11px] shrink-0">
                  Estimated Time: ~45 Mins
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
                {[
                  { step: '01', name: 'Framework Selection', cat: 'Setup', desc: 'Washington Accord, ABET, HEC, or Custom.' },
                  { step: '02', name: 'Course Information', cat: 'Identity', desc: 'Code, credits, prerequisites & catalog description.' },
                  { step: '03', name: 'Course Purpose', cat: 'Rationale', desc: 'Need statement & target student profile.' },
                  { step: '04', name: 'Learning Outcomes (CLOs)', cat: 'Outcomes', desc: 'Measurable verbs mapped to Bloom C1–C6.' },
                  { step: '05', name: 'Outcome Mapping Matrix', cat: 'Correlation', desc: 'Weighted correlation to Program Learning Outcomes.' },
                  { step: '06', name: 'Weekly Course Plan', cat: 'Schedule', desc: '15-week topic progression & core readings.' },
                  {
                    step: '07',
                    name: 'Teaching Activities (TLAs)',
                    cat: 'Pedagogy',
                    desc: 'TLA Catalog & Active Learning Engagement Meter (≥50%).',
                    highlight: true,
                  },
                  { step: '08', name: 'Assessment Plan', cat: 'Evidence', desc: '100% weightage total across formative & summative.' },
                  { step: '09', name: 'Alignment & Audit', cat: 'QA Audit', desc: 'Live gap detection & 360° constructive audit.' },
                  { step: '10', name: 'Review & Export', cat: 'Dossier', desc: '1-click PDF/Word dossiers & IMS Common Cartridge.' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border transition space-y-2 flex flex-col justify-between ${
                      item.highlight
                        ? 'bg-emerald-50/90 border-emerald-300 shadow-xs ring-2 ring-emerald-400/40'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between pb-1">
                        <span className="font-mono text-xs font-extrabold text-indigo-700">Step {item.step}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-bold uppercase">
                          {item.cat}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 leading-snug">{item.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-1">{item.desc}</p>
                    </div>
                    {item.highlight && (
                      <div className="pt-2 border-t border-emerald-200 text-[10px] font-bold text-emerald-800 flex items-center space-x-1">
                        <Star className="w-3 h-3 text-emerald-600" />
                        <span>Active Learning Engine</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-indigo-950 block text-sm">
                    Granular 15-Step Deep Curriculum Engineering Pathway
                  </span>
                  <span className="text-indigo-800">
                    Comprehensive full-scale syllabus design featuring modular learning outcomes (MLOs), week-by-week lesson creator, and 4-tier analytic rubrics.
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full bg-indigo-600 text-white font-bold font-mono text-[11px] shrink-0">
                  Full 15-Week Pipeline
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  { step: '01', name: 'Course Setup', cat: 'Meta' },
                  { step: '02', name: 'Course Blueprint', cat: 'Vision' },
                  { step: '03', name: 'CLO Creator', cat: 'Outcomes' },
                  { step: '04', name: 'CLO-PLO Matrix', cat: 'Mapping' },
                  { step: '05', name: 'Module Architecture', cat: 'Curriculum' },
                  { step: '06', name: 'MLO Creator', cat: 'Outcomes' },
                  { step: '07', name: 'Lesson Creator Studio', cat: 'Pedagogy', highlight: true },
                  { step: '08', name: 'Activity Designer', cat: 'Practice' },
                  { step: '09', name: 'Assessment Designer', cat: 'Evidence' },
                  { step: '10', name: 'Question Builder', cat: 'Items' },
                  { step: '11', name: 'Rubric Builder', cat: 'Grading' },
                  { step: '12', name: 'Evidence Rules', cat: 'Compliance' },
                  { step: '13', name: 'Alignment Auditor', cat: 'QA Audit' },
                  { step: '14', name: 'Course Preview', cat: 'Syllabus' },
                  { step: '15', name: 'Review & Export', cat: 'Deploy' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border transition space-y-1.5 ${
                      item.highlight
                        ? 'bg-indigo-50 border-indigo-300 shadow-xs ring-2 ring-indigo-400/40'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono font-bold text-indigo-700">Stage {item.step}</span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-slate-100 text-slate-600 font-bold uppercase">
                        {item.cat}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 leading-snug">{item.name}</h4>
                    {item.highlight ? (
                      <p className="text-[10px] text-indigo-900 font-semibold pt-0.5">
                        4 Modalities &amp; MLO Tracking
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-500 pt-0.5">Constructive verified</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
            <button
              onClick={onLaunchApp}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition cursor-pointer"
            >
              <span>Launch Curriculum Designer Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* DEDICATED LMS CONNECTORS SECTION (CORRECTS ANCHOR LINK) */}
      <section id="lms" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold uppercase tracking-wider">
              <GraduationCap className="w-3.5 h-3.5 text-purple-700" />
              <span>Universal LMS Interoperability</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold font-serif text-slate-900">
              Deploy Directly to Moodle, Blackboard, and Canvas
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Eliminate redundant data entry. OBE360 transforms designed courses, learning outcomes, and performance rubrics into certified open educational standards for seamless import into university learning platforms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900 uppercase">IMS Common Cartridge</span>
                <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-mono text-[10px] font-bold">.imscc</span>
              </div>
              <p className="text-xs text-slate-600">
                1.2 / 1.3 certified standard course package containing modular structure, topic descriptors, and metadata.
              </p>
              <div className="text-[11px] font-bold text-emerald-700 pt-2 border-t border-slate-100">
                ✓ Canvas &amp; Blackboard Ready
              </div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 uppercase">Moodle Competencies</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">CSV</span>
              </div>
              <p className="text-xs text-slate-600">
                Pre-formatted competency framework file ready for direct import into Moodle Competency Settings.
              </p>
              <div className="text-[11px] font-bold text-emerald-700 pt-2 border-t border-slate-100">
                ✓ Moodle 3.x–4.x Supported
              </div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 uppercase">Blackboard Rubrics</span>
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[10px] font-bold">XML</span>
              </div>
              <p className="text-xs text-slate-600">
                Direct Grade Center XML rubric file for immediate attachment to assignments, tests, and discussion boards.
              </p>
              <div className="text-[11px] font-bold text-emerald-700 pt-2 border-t border-slate-100">
                ✓ Learn Original &amp; Ultra
              </div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-900 uppercase">Canvas Outcomes</span>
                <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-mono text-[10px] font-bold">CSV</span>
              </div>
              <p className="text-xs text-slate-600">
                Structured learning outcome hierarchy with calculation methods, mastery criteria, and criterion levels.
              </p>
              <div className="text-[11px] font-bold text-emerald-700 pt-2 border-t border-slate-100">
                ✓ Canvas Cloud Compatible
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE ROI CALCULATOR - ACADEMIC PROCUREMENT DECISION SUPPORT */}
      <section id="roi" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <h2 className="text-xs font-bold text-indigo-700 uppercase tracking-widest">
            Institutional Business Case
          </h2>
          <h3 className="text-2xl sm:text-4xl font-bold font-serif text-slate-900">
            Calculate Your University's Faculty Hours &amp; Financial Savings
          </h3>
          <p className="text-xs text-slate-600">
            Adjust the sliders below to estimate the annual faculty time returned to teaching and research through automated OBE alignment.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Controls */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-800">
                  Full-Time Teaching Faculty in Department / Campus:
                </label>
                <span className="text-sm font-extrabold text-indigo-700 font-mono px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-lg">
                  {facultyCount} Professors
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={300}
                step={5}
                value={facultyCount}
                onChange={(e) => setFacultyCount(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>10 Faculty (Single Dept)</span>
                <span>150 (School)</span>
                <span>300+ (Full Campus)</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-800">
                  Active Course Offerings Per Academic Year:
                </label>
                <span className="text-sm font-extrabold text-indigo-700 font-mono px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-lg">
                  {coursesPerYear} Courses
                </span>
              </div>
              <input
                type="range"
                min={20}
                max={600}
                step={10}
                value={coursesPerYear}
                onChange={(e) => setCoursesPerYear(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>20 Courses</span>
                <span>250 Courses</span>
                <span>600+ Courses</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-600">
              <div className="font-bold text-slate-900">Methodology &amp; Benchmark Data:</div>
              <p className="text-[11px] leading-relaxed">
                Based on time-motion studies across Washington Accord engineering faculties. Traditional manual OBE documentation takes ~65 hours per course per semester. With MENTISERA OBE360™, structured guided workflows reduce this to ~3.5 hours.
              </p>
            </div>
          </div>

          {/* Results Display */}
          <div className="lg:col-span-5 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-2xl space-y-6 shadow-xl">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Annual Institutional Savings
            </div>

            <div className="space-y-1 border-b border-indigo-800 pb-5">
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
                {totalHoursSavedAnnual.toLocaleString()} hrs
              </div>
              <div className="text-xs text-indigo-200 font-medium">Faculty Administrative Hours Saved Annually</div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400">
                ${annualSavingsUsd.toLocaleString()} USD
              </div>
              <div className="text-xs text-slate-300 font-medium">
                Estimated Productivity Value (~{annualSavingsPkr} PKR)
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setDemoModalOpen(true)}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition shadow-lg cursor-pointer"
              >
                <span>Request Custom Campus Proposal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* INSTITUTIONAL PRICING & LICENSING TIERS */}
      <section id="pricing" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <h2 className="text-xs font-bold text-indigo-700 uppercase tracking-widest">
              Institutional Subscriptions
            </h2>
            <h3 className="text-2xl sm:text-4xl font-bold font-serif text-slate-900">
              Predictable Licensing for Departments &amp; University Campuses
            </h3>
            <p className="text-xs text-slate-600">
              Transparent institutional licensing with dedicated onboarding, LMS integration support, and accreditation consultation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Department Tier */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Academic Department
                </span>
                <h4 className="text-xl font-bold text-slate-900">Department Pilot</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ideal for an engineering or computing department preparing for an upcoming accreditation cycle.
                </p>
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-2xl font-extrabold text-slate-900 font-mono">Custom Tier</span>
                  <span className="text-xs text-slate-500 block">Annual departmental subscription</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-700 pt-2">
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Up to 30 Active Courses</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Dual-Engine: 10-Step Rapid &amp; 15-Step Granular</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>TLA Catalog &amp; Active Learning Engagement Meter</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>1-Click ABET / HEC PDF &amp; Word Dossiers</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>IMS Common Cartridge &amp; LMS Export</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setDemoModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 text-slate-800 font-semibold text-xs hover:bg-slate-100 transition cursor-pointer"
              >
                Inquire for Department
              </button>
            </div>

            {/* Campus Enterprise Tier */}
            <div className="bg-gradient-to-b from-indigo-50/70 to-white border-2 border-indigo-600 rounded-2xl p-6 sm:p-8 space-y-6 flex flex-col justify-between shadow-md relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                Most Popular for Campuses
              </div>

              <div className="space-y-4">
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                  Campus-Wide License
                </span>
                <h4 className="text-xl font-bold text-slate-900">University Enterprise</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Full institution-wide deployment across all faculties, schools, and academic governance cells.
                </p>
                <div className="pt-2 border-t border-indigo-100">
                  <span className="text-2xl font-extrabold text-slate-900 font-mono">Institutional Tier</span>
                  <span className="text-xs text-slate-500 block">Campus license with unlimited faculty</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-700 pt-2">
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span><strong>Unlimited</strong> Faculty &amp; Courses</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span><strong>Dual-Engine Workflows</strong> (10-Step Fast-Track &amp; 15-Week Deep)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span><strong>Active Learning Meter</strong> (Washington Accord Benchmark)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span><strong>15-Week Lesson Creator</strong> (4 Modalities &amp; Zero-Orphan MLOs)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span><strong>Gemini AI OBE Copilot</strong> Enabled</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span><strong>Direct REST &amp; LTI 1.3 LMS Sync</strong> (Moodle, Blackboard, Canvas)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Continuous Quality Improvement (CQI) Closed Loop</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Accreditation Onboarding &amp; Faculty Training</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setDemoModalOpen(true)}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-sm cursor-pointer"
              >
                Schedule Executive Demo
              </button>
            </div>

            {/* Ministry / System Tier */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Multi-Campus / Ministry
                </span>
                <h4 className="text-xl font-bold text-slate-900">National Council Tier</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  For university systems, higher education commissions, and regional accreditation bodies.
                </p>
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-2xl font-extrabold text-slate-900 font-mono">Government / System</span>
                  <span className="text-xs text-slate-500 block">Sovereign cloud or on-premise installation</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-700 pt-2">
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Multi-University Management Console</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>On-Premise / National Cloud Hosting</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Custom National Accord Alignment</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Dedicated Technical Architect &amp; SLA</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setDemoModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 text-slate-800 font-semibold text-xs hover:bg-slate-100 transition cursor-pointer"
              >
                Contact Enterprise Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER & OFFICIAL CORPORATE CONTACT (STRICTLY ALIGNED WITH USER BRIEF) */}
      <footer id="contact" className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
            {/* Column 1: Brand & Credentials */}
            <div className="space-y-4 md:col-span-1">
              <MentiseraLogo
                size="md"
                variant="light"
                showText={true}
                showTagline={false}
              />
              <p className="text-xs text-slate-400 leading-relaxed">
                The premier Outcome-Based Education (OBE) curriculum design and accreditation intelligence engine.
              </p>
              <div className="text-[11px] text-slate-400 space-y-1">
                <p><strong>All rights reserved by MENTISERA.</strong></p>
                <p>Proprietary Commercial Software License.</p>
              </div>
            </div>

            {/* Column 2: Official Contact Information */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold text-white uppercase tracking-wider">Official Inquiries</h5>
              <p className="text-xs text-slate-400">Send us an email for any inquiry:</p>
              <div className="space-y-2 text-xs">
                <a
                  href="mailto:hello@mentisera.pk"
                  className="flex items-center space-x-2 text-indigo-400 hover:text-indigo-300 transition"
                >
                  <Mail className="w-4 h-4 shrink-0" />
                  <span>hello@mentisera.pk</span>
                </a>
                <a
                  href="https://www.mentisera.pk/products/obe360"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-2 text-indigo-400 hover:text-indigo-300 transition"
                >
                  <Globe className="w-4 h-4 shrink-0" />
                  <span>www.mentisera.pk/products/obe360</span>
                </a>
              </div>
            </div>

            {/* Column 3: Phone & Support */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold text-white uppercase tracking-wider">Phone &amp; Direct Support</h5>
              <p className="text-xs text-slate-400">Give us a call during business hours:</p>
              <div className="space-y-2 text-xs">
                <a
                  href="tel:+923348880859"
                  className="flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 font-mono font-bold transition"
                >
                  <Phone className="w-4 h-4 shrink-0" />
                  <span>+92 334 8880859</span>
                </a>
                <p className="text-[11px] text-slate-400">Monday – Saturday: 9:00 AM – 6:00 PM PKT</p>
              </div>
            </div>

            {/* Column 4: Corporate Headquarters */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold text-white uppercase tracking-wider">Corporate Headquarters</h5>
              <div className="flex items-start space-x-2 text-xs text-slate-400">
                <MapPin className="w-4 h-4 shrink-0 text-indigo-400 mt-0.5" />
                <address className="not-italic leading-relaxed">
                  <strong>MENTISERA Technologies</strong><br />
                  Street 11, Ghuari Town, 5-B<br />
                  Islamabad, Pakistan
                </address>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <div>
              © 2026 MENTISERA. All Rights Reserved. Built for global higher education standards.
            </div>
            <div className="flex space-x-6">
              <button onClick={onLaunchApp} className="hover:text-white transition cursor-pointer">
                Enter App
              </button>
              <a href="#accreditation" className="hover:text-white transition">
                Accreditations
              </a>
              <a href="#pricing" className="hover:text-white transition">
                Pricing
              </a>
              <a href="mailto:hello@mentisera.pk" className="hover:text-white transition">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* BOOK DEMO MODAL */}
      {demoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl text-slate-900 space-y-5 relative">
            <button
              onClick={() => {
                setDemoModalOpen(false);
                setDemoFormSubmitted(false);
              }}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {demoFormSubmitted ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold font-serif">Inquiry Successfully Transmitted</h4>
                <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                  Thank you for reaching out to MENTISERA. An academic technology specialist will contact you within 24 business hours to arrange your campus pilot presentation.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setDemoModalOpen(false);
                      setDemoFormSubmitted(false);
                    }}
                    className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition cursor-pointer"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold uppercase mb-1.5">
                    Campus Pilot &amp; Demo
                  </div>
                  <h4 className="text-xl font-bold font-serif text-slate-900">
                    Schedule Your Institution's Presentation
                  </h4>
                  <p className="text-xs text-slate-500">
                    Experience how MENTISERA OBE360™ will streamline your next accreditation visit.
                  </p>
                </div>

                <form onSubmit={handleDemoSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Prof. Dr. Sarah Ahmed"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Institution / University *</label>
                      <input
                        type="text"
                        required
                        value={formData.institution}
                        onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                        placeholder="NUST / FAST / IBA"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Academic Designation *</label>
                      <input
                        type="text"
                        required
                        value={formData.designation}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        placeholder="Dean / HOD / Director QEC"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Official Email *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="s.ahmed@university.edu.pk"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+92 300 1234567"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Target Accreditation Accord</label>
                    <select
                      value={formData.accreditationTarget}
                      onChange={(e) => setFormData({ ...formData, accreditationTarget: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs bg-white"
                    >
                      <option>Washington Accord (IEA)</option>
                      <option>ABET (EAC / CAC / ETAC)</option>
                      <option>Higher Education Commission (HEC Pakistan)</option>
                      <option>National Board of Accreditation (NBA India)</option>
                      <option>Sydney / Seoul Accord</option>
                      <option>General Outcome-Based Education (OBE)</option>
                    </select>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
                    >
                      Transmit Institutional Inquiry
                    </button>
                  </div>

                  <div className="text-[10px] text-slate-500 text-center pt-1">
                    Direct inquiries: <a href="mailto:hello@mentisera.pk" className="text-indigo-600 underline">hello@mentisera.pk</a> | Phone: <a href="tel:+923348880859" className="text-indigo-600 underline">+92 334 8880859</a>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
