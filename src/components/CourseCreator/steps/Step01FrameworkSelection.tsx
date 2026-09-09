import React, { useState } from 'react';
import {
  ShieldCheck,
  Award,
  Globe,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Info,
  ChevronRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { Course, Framework } from '../../../types';
import {
  INITIAL_FRAMEWORKS,
  INITIAL_FRAMEWORK_VERSIONS,
  INITIAL_FRAMEWORK_OUTCOMES,
  getFrameworkById,
  getFrameworkOutcomes,
} from '../../../data/frameworksData';

interface StepProps {
  course: Course;
  onChange: (updated: Course) => void;
  onNext: () => void;
  onAskCopilot?: (prompt: string) => void;
}

export const Step01FrameworkSelection: React.FC<StepProps> = ({
  course,
  onChange,
  onNext,
  onAskCopilot,
}) => {
  const currentFrameworkId = course.frameworkId || 'fw-abet-cac';
  const [selectedFwId, setSelectedFwId] = useState<string>(currentFrameworkId);
  const [filterType, setFilterType] = useState<string>('all');

  const selectedFramework = getFrameworkById(selectedFwId);
  const frameworkOutcomes = getFrameworkOutcomes(selectedFwId);
  const frameworkVersion =
    INITIAL_FRAMEWORK_VERSIONS.find((v) => v.frameworkId === selectedFramework.id) ||
    INITIAL_FRAMEWORK_VERSIONS[0];

  const handleSelectFramework = (framework: Framework) => {
    setSelectedFwId(framework.id);
    const version =
      INITIAL_FRAMEWORK_VERSIONS.find((v) => v.frameworkId === framework.id) ||
      INITIAL_FRAMEWORK_VERSIONS[0];
    const outcomes = getFrameworkOutcomes(framework.id);

    // Auto-populate course PLOs from framework outcomes
    const updatedPLOs = outcomes.map((o) => ({
      id: o.id,
      code: o.code,
      title: o.title,
      description: o.description,
    }));

    onChange({
      ...course,
      frameworkId: framework.id,
      frameworkVersionId: version.id,
      plos: updatedPLOs,
    });
  };

  const filteredFrameworks = INITIAL_FRAMEWORKS.filter((fw) => {
    if (filterType === 'all') return true;
    if (filterType === 'international')
      return fw.badge === 'International Recognition Framework';
    if (filterType === 'accreditation')
      return fw.badge === 'Accreditation Commission';
    if (filterType === 'national')
      return fw.badge === 'National Higher Education Framework';
    if (filterType === 'general')
      return fw.badge === 'Educational Framework' || fw.badge === 'Institutional Framework';
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

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
          <span>Step 01 of 10</span>
          <span>•</span>
          <span>Accreditation Alignment</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 font-serif">
          Target Accreditation & OBE Framework
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Select the governing accreditation standard or educational framework for your course.
          This dynamically binds your Graduate Attributes, Student Outcomes, and mapping terminology.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 pt-1 border-b border-slate-200 pb-3">
        {[
          { id: 'all', label: 'All Frameworks (10)' },
          { id: 'international', label: 'International Accords (3)' },
          { id: 'accreditation', label: 'ABET Commissions (3)' },
          { id: 'national', label: 'National Councils (HEC / NBA)' },
          { id: 'general', label: 'General & Custom Institutional' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
              filterType === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 2-Column: Framework Cards on Left, Detail Panel on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Framework Cards */}
        <div className="lg:col-span-7 space-y-3">
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
            Select Framework Standard
          </div>

          <div className="space-y-2.5">
            {filteredFrameworks.map((fw) => {
              const isSelected = selectedFwId === fw.id;
              return (
                <div
                  key={fw.id}
                  onClick={() => handleSelectFramework(fw)}
                  className={`p-4 rounded-xl border-2 transition cursor-pointer relative ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/40 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getBadgeStyle(
                            fw.badge
                          )}`}
                        >
                          {fw.badge}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {fw.code}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {fw.name}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {fw.description}
                      </p>
                    </div>

                    <div className="pt-0.5">
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-2xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-300" />
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-medium text-slate-600">
                      Discipline: <span className="text-slate-700">{fw.discipline}</span>
                    </span>
                    <span className="text-indigo-600 font-semibold flex items-center gap-1">
                      {isSelected ? 'Active Selection' : 'Click to Apply'}
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Framework Information Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs sticky top-20 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Framework Information Panel
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                {frameworkVersion.status} Standard
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider block">
                  Framework Name
                </span>
                <span className="font-semibold text-slate-900 text-sm">
                  {selectedFramework.name}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider block">
                    Type
                  </span>
                  <span className="text-slate-800">{selectedFramework.type}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider block">
                    Jurisdiction
                  </span>
                  <span className="text-slate-800">{selectedFramework.jurisdiction}</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider block">
                  Applicable Terminology
                </span>
                <span className="text-slate-700 font-medium">
                  {selectedFramework.applicableTerminology}
                </span>
              </div>

              <div>
                <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider block">
                  Outcome Model
                </span>
                <span className="text-slate-700 font-medium">
                  {selectedFramework.outcomeModel}
                </span>
              </div>

              <div>
                <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider block">
                  Recommended Mapping Model
                </span>
                <span className="text-slate-700">
                  {selectedFramework.recommendedMappingApproach}
                </span>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-amber-900 text-[11px] leading-relaxed">
                <span className="font-bold block mb-0.5">Accreditation Advisory:</span>
                {selectedFramework.notes}
              </div>
            </div>

            {/* Dynamic Outcomes List Preview */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800">
                  Program Outcomes / Attributes ({frameworkOutcomes.length})
                </span>
                <span className="text-[10px] text-slate-400">
                  Version: {frameworkVersion.versionName.split(' ')[0]}
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 text-xs">
                {frameworkOutcomes.map((o) => (
                  <div
                    key={o.id}
                    className="p-2 bg-slate-50 rounded-md border border-slate-200/80"
                  >
                    <div className="font-bold text-indigo-700 text-[11px]">
                      {o.code}: {o.title}
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">
                      {o.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step Footer Navigation */}
      <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
        <div className="text-xs text-slate-500">
          Framework selected: <strong className="text-slate-800">{selectedFramework.name}</strong>
        </div>
        <button
          onClick={onNext}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-200 transition cursor-pointer"
        >
          <span>Continue to Course Information</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
