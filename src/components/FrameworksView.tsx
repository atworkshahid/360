import React, { useState } from 'react';
import {
  ShieldCheck,
  Award,
  Globe,
  CheckCircle2,
  BookOpen,
  Search,
  ExternalLink,
  ChevronRight,
  Info,
  X,
  ArrowLeft,
  Download,
  FileText,
} from 'lucide-react';
import { Framework } from '../types';
import {
  INITIAL_FRAMEWORKS,
  INITIAL_FRAMEWORK_VERSIONS,
  getFrameworkOutcomes,
} from '../data/frameworksData';
import { downloadFrameworkGuidebookPDF } from '../utils/frameworkGuidebookPdf';
import { Guidebook } from './Guidebook';

interface FrameworksViewProps {
  onBack?: () => void;
}

export const FrameworksView: React.FC<FrameworksViewProps> = ({ onBack }) => {
  const [selectedFramework, setSelectedFramework] = useState<Framework | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [guidebookOpen, setGuidebookOpen] = useState<boolean>(false);
  const [guidebookFwId, setGuidebookFwId] = useState<string>('fw-washington-accord');

  const filteredFrameworks = INITIAL_FRAMEWORKS.filter((fw) => {
    const q = (searchQuery || '').toLowerCase();
    const matchesSearch =
      (fw.name || '').toLowerCase().includes(q) ||
      (fw.code || '').toLowerCase().includes(q) ||
      (fw.discipline || '').toLowerCase().includes(q);
    if (!matchesSearch) return false;

    if (filterType === 'all') return true;
    if (filterType === 'international')
      return fw.badge === 'International Recognition Framework';
    if (filterType === 'accreditation')
      return fw.badge === 'Accreditation Commission';
    if (filterType === 'national')
      return fw.badge === 'National Higher Education Framework';
    if (filterType === 'general')
      return (
        fw.badge === 'Educational Framework' || fw.badge === 'Institutional Framework'
      );
    return true;
  });

  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case 'International Recognition Framework':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Accreditation Commission':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'National Higher Education Framework':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const selectedOutcomes = selectedFramework
    ? getFrameworkOutcomes(selectedFramework.id)
    : [];

  return (
    <div className="max-w-6xl mx-auto p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
            <span>Accreditation Standards</span>
            <span>•</span>
            <span>Graduate Attributes Library</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-serif">
            Accreditation & OBE Frameworks
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pre-configured international accords, commission criteria, and national standards with standardized graduate attributes and terminology.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setGuidebookFwId('fw-washington-accord');
              setGuidebookOpen(true);
            }}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
            title="Open Interactive OBE Accreditation Guidebook & PDF Viewer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Open Guidebook &amp; PDF</span>
          </button>

          <button
            type="button"
            onClick={() =>
              downloadFrameworkGuidebookPDF({
                frameworkId: 'fw-washington-accord',
                frameworkName: 'Washington Accord-aligned Engineering OBE',
              })
            }
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
            title="Download complete Accreditation & OBE Frameworks Guidebook (PDF)"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Direct PDF</span>
            <Download className="w-3 h-3 text-indigo-500" />
          </button>

          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Courses</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1.5 flex-wrap">
          {[
            { id: 'all', label: 'All Standards (10)' },
            { id: 'international', label: 'International Accords (3)' },
            { id: 'accreditation', label: 'ABET Commissions (3)' },
            { id: 'national', label: 'National Councils (HEC / NBA)' },
            { id: 'general', label: 'General & Custom' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
                filterType === tab.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search standards or discipline..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Frameworks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFrameworks.map((fw) => {
          const outcomes = getFrameworkOutcomes(fw.id);
          const version = INITIAL_FRAMEWORK_VERSIONS.find((v) => v.frameworkId === fw.id);

          return (
            <div
              key={fw.id}
              onClick={() => setSelectedFramework(fw)}
              className="p-5 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-xs transition cursor-pointer flex flex-col justify-between group space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getBadgeStyle(
                      fw.badge
                    )}`}
                  >
                    {fw.badge}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {fw.code}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition">
                  {fw.name}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2">{fw.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <span>Discipline: <strong className="text-slate-800">{fw.discipline}</strong></span>
                  <span>Jurisdiction: <strong className="text-slate-800">{fw.jurisdiction}</strong></span>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="font-bold text-indigo-700">
                    {outcomes.length} Standard Attributes
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setGuidebookFwId(fw.id);
                        setGuidebookOpen(true);
                      }}
                      className="text-slate-500 hover:text-indigo-600 hover:underline flex items-center gap-0.5 font-medium"
                      title={`View ${fw.code} Guidebook & PDF`}
                    >
                      <BookOpen className="w-3 h-3 text-indigo-500" />
                      <span>PDF</span>
                    </button>
                    <span className="text-slate-300">·</span>
                    <span className="text-indigo-600 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition">
                      <span>Inspect</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Framework Detail Drawer / Modal */}
      {selectedFramework && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 shadow-xl max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getBadgeStyle(
                      selectedFramework.badge
                    )}`}
                  >
                    {selectedFramework.badge}
                  </span>
                  <span className="text-xs font-mono text-slate-400 font-bold">
                    {selectedFramework.code}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 font-serif">
                  {selectedFramework.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedFramework(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto py-4 space-y-4 flex-1 text-xs">
              <p className="text-slate-600 leading-relaxed">
                {selectedFramework.description}
              </p>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[10px] block">
                    Discipline
                  </span>
                  <span className="text-slate-800 font-medium">
                    {selectedFramework.discipline}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[10px] block">
                    Jurisdiction
                  </span>
                  <span className="text-slate-800 font-medium">
                    {selectedFramework.jurisdiction}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[10px] block">
                    Outcome Model
                  </span>
                  <span className="text-slate-800 font-medium">
                    {selectedFramework.outcomeModel}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[10px] block">
                    Terminology
                  </span>
                  <span className="text-slate-800 font-medium">
                    {selectedFramework.applicableTerminology}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                <span className="font-bold block mb-0.5">Accreditation Advisory:</span>
                {selectedFramework.notes}
              </div>

              {/* Outcomes List */}
              <div className="space-y-2 pt-2">
                <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
                  Associated Graduate Attributes / Outcomes ({selectedOutcomes.length})
                </h4>
                <div className="space-y-2">
                  {selectedOutcomes.map((o) => (
                    <div
                      key={o.id}
                      className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1"
                    >
                      <div className="font-bold text-indigo-700 text-xs">
                        {o.code}: {o.title}
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {o.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setGuidebookFwId(selectedFramework.id);
                    setGuidebookOpen(true);
                  }}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Open {selectedFramework.code} Guidebook &amp; PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    downloadFrameworkGuidebookPDF({
                      frameworkId: selectedFramework.id,
                      frameworkName: selectedFramework.name,
                    })
                  }
                  className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                  title={`Download ${selectedFramework.code} Guidebook in PDF`}
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">Direct Download</span>
                  <Download className="w-3 h-3 text-indigo-500" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedFramework(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guidebook Modal */}
      <Guidebook
        isOpen={guidebookOpen}
        onClose={() => setGuidebookOpen(false)}
        initialFrameworkId={guidebookFwId}
      />
    </div>
  );
};
