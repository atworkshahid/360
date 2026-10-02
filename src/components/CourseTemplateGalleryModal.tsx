import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Search,
  Sparkles,
  Layers,
  CheckCircle2,
  BookOpen,
  Code,
  FlaskConical,
  Scale,
  Briefcase,
  ChevronRight,
  ArrowRight,
  Award,
  Clock,
  GraduationCap,
  FileText,
  BarChart3,
  Calendar,
  Check,
  ShieldCheck,
  HelpCircle,
  Eye,
  Sliders,
} from 'lucide-react';
import { Course } from '../types';
import {
  GALLERY_TEMPLATES,
  CourseTemplateGalleryItem,
  TemplateDiscipline,
} from '../data/courseTemplatesData';

interface CourseTemplateGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (course: Course) => void;
  initialDiscipline?: TemplateDiscipline | 'All';
}

export const CourseTemplateGalleryModal: React.FC<CourseTemplateGalleryModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  initialDiscipline = 'All',
}) => {
  const [selectedDiscipline, setSelectedDiscipline] = useState<TemplateDiscipline | 'All'>(
    initialDiscipline
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    GALLERY_TEMPLATES[0]?.id || ''
  );
  const [previewTab, setPreviewTab] = useState<'overview' | 'clos' | 'modules' | 'assessments'>('overview');

  // Customization state for quick launch
  const [customTitle, setCustomTitle] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedDiscipline(initialDiscipline);
      setSearchQuery('');
      setIsCustomizing(false);
      setIsLaunching(false);
      setPreviewTab('overview');
      if (GALLERY_TEMPLATES.length > 0) {
        setSelectedTemplateId(GALLERY_TEMPLATES[0].id);
        setCustomTitle(`${GALLERY_TEMPLATES[0].title} (Cohort 2026)`);
        setCustomCode(`${GALLERY_TEMPLATES[0].code}-26`);
      }
    }
  }, [isOpen, initialDiscipline]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return GALLERY_TEMPLATES.filter((tmpl) => {
      const matchesDiscipline =
        selectedDiscipline === 'All' || tmpl.discipline === selectedDiscipline;
      if (!matchesDiscipline) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        tmpl.title.toLowerCase().includes(q) ||
        tmpl.code.toLowerCase().includes(q) ||
        tmpl.disciplineLabel.toLowerCase().includes(q) ||
        tmpl.summary.toLowerCase().includes(q) ||
        tmpl.competencies.some((c) => c.toLowerCase().includes(q)) ||
        tmpl.skills.some((s) => s.toLowerCase().includes(q)) ||
        tmpl.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [selectedDiscipline, searchQuery]);

  // Active template
  const activeTemplate = useMemo(() => {
    return (
      filteredTemplates.find((t) => t.id === selectedTemplateId) ||
      filteredTemplates[0] ||
      GALLERY_TEMPLATES[0]
    );
  }, [filteredTemplates, selectedTemplateId]);

  // When active template changes, update default customization fields
  useEffect(() => {
    if (activeTemplate) {
      setCustomTitle(`${activeTemplate.title} (Cohort 2026)`);
      setCustomCode(`${activeTemplate.code}-26`);
    }
  }, [activeTemplate?.id]);

  if (!isOpen) return null;

  const handleLaunch = () => {
    if (!activeTemplate) return;
    setIsLaunching(true);
    setTimeout(() => {
      const newCourse = activeTemplate.buildCourse(
        customTitle.trim() || undefined,
        customCode.trim() || undefined
      );
      onSelectTemplate(newCourse);
      setIsLaunching(false);
      onClose();
    }, 250);
  };

  const getDisciplineIcon = (disc: TemplateDiscipline, className = 'w-4 h-4') => {
    switch (disc) {
      case 'Technical':
        return <Code className={className} />;
      case 'Science':
        return <FlaskConical className={className} />;
      case 'Humanities':
        return <Scale className={className} />;
      case 'Business':
        return <Briefcase className={className} />;
      default:
        return <BookOpen className={className} />;
    }
  };

  const disciplineCounts = {
    All: GALLERY_TEMPLATES.length,
    Technical: GALLERY_TEMPLATES.filter((t) => t.discipline === 'Technical').length,
    Science: GALLERY_TEMPLATES.filter((t) => t.discipline === 'Science').length,
    Humanities: GALLERY_TEMPLATES.filter((t) => t.discipline === 'Humanities').length,
    Business: GALLERY_TEMPLATES.filter((t) => t.discipline === 'Business').length,
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="template-gallery-title"
      >
        {/* Modal Top Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/70 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Curriculum Fast-Track & Jumpstart</span>
            </div>
            <h2 id="template-gallery-title" className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Course Template Gallery
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              Launch accredited, outcome-based curricula in seconds with pre-configured Bloom-aligned learning goals, weekly modular plans, authentic assessments, and evaluation rubrics across <span className="font-semibold text-indigo-700">Technical</span>, <span className="font-semibold text-emerald-700">Science</span>, <span className="font-semibold text-amber-700">Humanities</span>, and <span className="font-semibold text-sky-700">Business</span> disciplines.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer shrink-0"
            title="Close modal (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="px-6 py-3.5 bg-white border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Discipline Category Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {(
              [
                { id: 'All', label: 'All Disciplines', icon: Layers },
                { id: 'Technical', label: 'Technical & Engineering', icon: Code },
                { id: 'Science', label: 'Natural Sciences', icon: FlaskConical },
                { id: 'Humanities', label: 'Humanities & Law', icon: Scale },
                { id: 'Business', label: 'Business & Management', icon: Briefcase },
              ] as const
            ).map((tab) => {
              const count = disciplineCounts[tab.id];
              const isSelected = selectedDiscipline === tab.id;
              const TabIcon = tab.icon;

              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedDiscipline(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Search Box */}
          <div className="relative w-full md:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates or skills..."
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Main Content: Two Panel Split */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-[460px]">
          {/* Left Column: Template Cards List */}
          <div className="w-full lg:w-5/12 border-b lg:border-b-0 lg:border-r border-slate-200 overflow-y-auto p-4 space-y-3 bg-slate-50/40">
            <div className="flex items-center justify-between text-xs text-slate-500 px-1 mb-1">
              <span>{filteredTemplates.length} templates available</span>
              <span>Click to preview blueprint</span>
            </div>

            {filteredTemplates.map((template) => {
              const isSelected = activeTemplate?.id === template.id;
              const discIcon = getDisciplineIcon(template.discipline, 'w-4 h-4');

              return (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplateId(template.id)}
                  className={`p-4 rounded-xl border transition cursor-pointer relative text-left group ${
                    isSelected
                      ? 'bg-white border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                      : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  {/* Top Badge & Discipline Tag */}
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border flex items-center space-x-1 ${template.colorTheme.badgeBg} ${template.colorTheme.badgeText} ${template.colorTheme.badgeBorder}`}
                    >
                      {discIcon}
                      <span>{template.disciplineLabel}</span>
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 group-hover:text-slate-600 transition">
                      {template.code}
                    </span>
                  </div>

                  {/* Title & Short Description */}
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition leading-snug">
                    {template.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {template.summary}
                  </p>

                  {/* Visual Bloom's Mini Distribution Bar */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span>Bloom's Taxonomy Distribution</span>
                      <span className="font-semibold text-slate-600">4 CLOs</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full overflow-hidden flex bg-slate-100">
                      {template.bloomsDistribution.map((item, idx) => (
                        <div
                          key={idx}
                          style={{ width: `${item.percentage}%` }}
                          className={`${item.color} h-full`}
                          title={`${item.label}: ${item.percentage}%`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Footer Stats */}
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center space-x-2">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{template.durationWeeks} Wks</span>
                      </span>
                      <span>•</span>
                      <span>{template.creditHours} Cr</span>
                      <span>•</span>
                      <span>{template.modules.length} Modules</span>
                    </div>
                    <span
                      className={`text-xs font-bold flex items-center space-x-0.5 ${
                        isSelected ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-700'
                      }`}
                    >
                      <span>Preview</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12 px-4">
                <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No matching templates found</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Try clearing your search query or switching discipline tabs.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedDiscipline('All');
                  }}
                  className="mt-3 px-3 py-1.5 bg-indigo-50 text-indigo-700 font-bold rounded-lg text-xs hover:bg-indigo-100 transition cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>

          {/* Right Column: In-Depth Visual Preview Inspector */}
          {activeTemplate ? (
            <div className="w-full lg:w-7/12 flex flex-col bg-white overflow-hidden">
              {/* Template Hero Banner */}
              <div
                className={`p-6 bg-gradient-to-br ${activeTemplate.colorTheme.gradient} text-white relative shrink-0`}
              >
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 backdrop-blur-xs text-white px-2.5 py-0.5 rounded-full border border-white/20">
                    {activeTemplate.disciplineLabel}
                  </span>
                  <span className="text-[10px] font-semibold bg-white/10 text-white/90 px-2 py-0.5 rounded-full">
                    {activeTemplate.level} • {activeTemplate.creditHours} Credits
                  </span>
                  <span className="text-[10px] font-semibold bg-white/10 text-white/90 px-2 py-0.5 rounded-full flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{activeTemplate.accreditationBody}</span>
                  </span>
                </div>

                <h3 className="text-xl font-extrabold tracking-tight text-white mt-1">
                  {activeTemplate.title}
                </h3>
                <p className="text-xs text-white/80 mt-1.5 max-w-xl line-clamp-2 leading-relaxed">
                  {activeTemplate.fullDescription}
                </p>

                {/* Primary Quick Actions */}
                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={handleLaunch}
                    disabled={isLaunching}
                    className="px-4 py-2 bg-white text-slate-950 font-bold text-xs rounded-xl hover:bg-slate-100 transition shadow-lg shadow-black/20 flex items-center space-x-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{isLaunching ? 'Creating Course...' : 'Use This Template'}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                  </button>

                  <button
                    onClick={() => setIsCustomizing(!isCustomizing)}
                    className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white font-semibold text-xs rounded-xl backdrop-blur-xs transition border border-white/20 flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>{isCustomizing ? 'Hide Customization' : 'Customize Title & Code'}</span>
                  </button>
                </div>

                {/* Optional Customization Drawer */}
                {isCustomizing && (
                  <div className="mt-4 p-3.5 bg-black/25 backdrop-blur-md rounded-xl border border-white/20 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left animate-in fade-in">
                    <div>
                      <label className="block text-[10px] font-bold text-white/80 mb-1">
                        Course Title
                      </label>
                      <input
                        type="text"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        placeholder={activeTemplate.title}
                        className="w-full px-2.5 py-1.5 text-xs bg-white text-slate-900 rounded-lg focus:outline-hidden font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-white/80 mb-1">
                        Course Code
                      </label>
                      <input
                        type="text"
                        value={customCode}
                        onChange={(e) => setCustomCode(e.target.value)}
                        placeholder={activeTemplate.code}
                        className="w-full px-2.5 py-1.5 text-xs bg-white text-slate-900 rounded-lg focus:outline-hidden font-medium"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Preview Navigation Tabs */}
              <div className="flex items-center border-b border-slate-200 bg-slate-50/70 px-6 shrink-0">
                {(
                  [
                    { id: 'overview', label: 'Overview & Blueprint', icon: BookOpen },
                    { id: 'clos', label: 'Outcomes (CLOs)', icon: Award },
                    { id: 'modules', label: 'Modular Schedule', icon: Calendar },
                    { id: 'assessments', label: 'Assessments & Rubrics', icon: BarChart3 },
                  ] as const
                ).map((tab) => {
                  const isTabActive = previewTab === tab.id;
                  const TabIcon = tab.icon;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setPreviewTab(tab.id)}
                      className={`px-3.5 py-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition cursor-pointer ${
                        isTabActive
                          ? 'border-indigo-600 text-indigo-600'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <TabIcon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Preview Tab Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* 1. OVERVIEW & BLUEPRINT TAB */}
                {previewTab === 'overview' && (
                  <div className="space-y-4 text-left">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Target Learners
                        </span>
                        <p className="text-xs font-semibold text-slate-800 mt-1">
                          {activeTemplate.targetLearners}
                        </p>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Academic Level & Hours
                        </span>
                        <p className="text-xs font-semibold text-slate-800 mt-1">
                          {activeTemplate.level} • 135+ Study Hours
                        </p>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Accreditation Alignment
                        </span>
                        <p className="text-xs font-semibold text-indigo-700 mt-1">
                          {activeTemplate.accreditationBody}
                        </p>
                      </div>
                    </div>

                    {/* Capstone Goal Highlight */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50/70 to-blue-50/50 border border-indigo-100">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-900 mb-1">
                        <GraduationCap className="w-4 h-4 text-indigo-600" />
                        <span>Capstone Capability Promise</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        "{activeTemplate.capstoneGoal}"
                      </p>
                    </div>

                    {/* Core Competencies & Skills */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border border-slate-200 rounded-xl p-3.5">
                        <h5 className="text-xs font-bold text-slate-900 mb-2 flex items-center space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Target Competencies</span>
                        </h5>
                        <ul className="space-y-1.5">
                          {activeTemplate.competencies.map((comp, idx) => (
                            <li key={idx} className="text-xs text-slate-600 flex items-start space-x-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                              <span>{comp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="border border-slate-200 rounded-xl p-3.5">
                        <h5 className="text-xs font-bold text-slate-900 mb-2 flex items-center space-x-1.5">
                          <Code className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Applied Technical Skills</span>
                        </h5>
                        <div className="flex flex-wrap gap-1.5">
                          {activeTemplate.skills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. COURSE LEARNING OUTCOMES (CLOS) TAB */}
                {previewTab === 'clos' && (
                  <div className="space-y-3 text-left">
                    <p className="text-xs text-slate-500 mb-1">
                      Each CLO is formulated with measurable Bloom verbs, achievement thresholds, and verified constructive alignment with assessments:
                    </p>

                    {activeTemplate.clos.map((clo) => {
                      const getBloomBadgeColor = (lvl: string) => {
                        switch (lvl) {
                          case 'Understand':
                            return 'bg-blue-50 text-blue-700 border-blue-200';
                          case 'Apply':
                            return 'bg-emerald-50 text-emerald-700 border-emerald-200';
                          case 'Analyze':
                            return 'bg-indigo-50 text-indigo-700 border-indigo-200';
                          case 'Evaluate':
                            return 'bg-purple-50 text-purple-700 border-purple-200';
                          case 'Create':
                            return 'bg-amber-50 text-amber-800 border-amber-200';
                          default:
                            return 'bg-slate-50 text-slate-700 border-slate-200';
                        }
                      };

                      return (
                        <div
                          key={clo.code}
                          className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition"
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-extrabold text-slate-900 bg-slate-200/80 px-2 py-0.5 rounded-md">
                                {clo.code}
                              </span>
                              <span
                                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${getBloomBadgeColor(
                                  clo.bloomLevel
                                )}`}
                              >
                                Bloom {clo.bloomLevel}
                              </span>
                            </div>
                            <span className="text-[11px] font-bold text-slate-500">
                              Weight: {clo.weight}% • Threshold: {clo.threshold}%
                            </span>
                          </div>

                          <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                            {clo.statement}
                          </p>

                          <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                            <span className="text-slate-600 font-medium">
                              🎯 Assessment: <span className="font-semibold text-indigo-700">{clo.assessment}</span>
                            </span>
                            <span className="text-slate-400">Competency: {clo.competency}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 3. MODULAR SCHEDULE (16 WEEKS) TAB */}
                {previewTab === 'modules' && (
                  <div className="space-y-3 text-left">
                    <p className="text-xs text-slate-500 mb-1">
                      Structured 16-week modular sequence with constructive scaffolding:
                    </p>

                    {activeTemplate.modules.map((mod) => (
                      <div
                        key={mod.number}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-extrabold text-indigo-700">
                            Module {mod.number} • {mod.weeks}
                          </span>
                          <div className="flex items-center space-x-1">
                            {mod.cloCodes.map((code) => (
                              <span
                                key={code}
                                className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.2 rounded"
                              >
                                {code}
                              </span>
                            ))}
                          </div>
                        </div>

                        <h5 className="text-xs font-bold text-slate-900">{mod.title}</h5>
                        <p className="text-[11px] text-slate-500 mt-0.5">{mod.description}</p>

                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {mod.topics.map((topic, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                            >
                              • {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 4. ASSESSMENTS & RUBRICS TAB */}
                {previewTab === 'assessments' && (
                  <div className="space-y-4 text-left">
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 mb-2">
                        Aligned Assessment Strategy
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {activeTemplate.assessments.map((asmt, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between"
                          >
                            <div>
                              <p className="text-xs font-bold text-slate-800">{asmt.name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {asmt.type} • Bloom {asmt.bloom}
                              </p>
                            </div>
                            <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-lg">
                              {asmt.weight}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sample Rubric Criteria */}
                    <div className="pt-3 border-t border-slate-200">
                      <h5 className="text-xs font-bold text-slate-900 mb-2 flex items-center space-x-1.5">
                        <Award className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{activeTemplate.sampleRubric.title}</span>
                      </h5>
                      <div className="space-y-2">
                        {activeTemplate.sampleRubric.criteria.map((crit, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl border border-slate-200 bg-white text-xs"
                          >
                            <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                              <span>{crit.name}</span>
                              <span className="text-[11px] text-indigo-600 font-extrabold">
                                Weight: {crit.weight}%
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-relaxed">
                              <span className="font-semibold text-emerald-700">Exemplary Standard: </span>
                              {crit.exemplaryDescriptor}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Quick-Launch Bar */}
              <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3 shrink-0">
                <div className="text-xs text-slate-500">
                  Ready to deploy as <span className="font-bold text-slate-800">"{customTitle}"</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={onClose}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLaunch}
                    disabled={isLaunching}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition shadow-xs shadow-indigo-200 flex items-center space-x-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isLaunching ? 'Setting Up...' : 'Start with This Blueprint'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full lg:w-7/12 flex items-center justify-center p-12 text-center text-slate-400">
              <p className="text-xs">Select a template on the left to inspect its complete blueprint.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
