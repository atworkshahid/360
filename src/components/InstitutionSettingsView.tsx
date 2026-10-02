import React, { useState, useEffect } from 'react';
import {
  Building2,
  Save,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  Globe,
  Sliders,
  Award,
  ArrowLeft,
  Cloud,
} from 'lucide-react';
import { Institution, OutcomeMappingScale } from '../types';
import {
  DEFAULT_INSTITUTION,
  getStoredInstitution,
  saveStoredInstitution,
  fetchServerInstitution,
  updateServerInstitution,
} from '../data/institutionData';
import { INITIAL_FRAMEWORKS } from '../data/frameworksData';
import { InstitutionalLogoUploader } from './InstitutionalLogoUploader';

interface InstitutionSettingsViewProps {
  onBack?: () => void;
}

export const InstitutionSettingsView: React.FC<InstitutionSettingsViewProps> = ({ onBack }) => {
  const [institution, setInstitution] = useState<Institution>(getStoredInstitution);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchServerInstitution().then((serverInst) => {
      if (serverInst) {
        setInstitution(serverInst);
      }
    });
  }, []);

  const handleChange = (field: keyof Institution, value: any) => {
    setInstitution((prev) => ({ ...prev, [field]: value }));
    setSavedSuccess(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await updateServerInstitution(institution);
      setInstitution(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (confirm('Reset institution settings to default Apex Institute parameters?')) {
      setIsSaving(true);
      try {
        const updated = await updateServerInstitution(DEFAULT_INSTITUTION);
        setInstitution(updated);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2000);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
            <span>Governance & Administration</span>
            <span>•</span>
            <span>Institutional Model</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-serif">
            Institution & Accreditation Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure single-institution branding, academic calendars, default accreditation standards, and mapping conventions.
          </p>
        </div>

        <div className="flex items-center gap-2">
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

          <button
            type="button"
            onClick={handleReset}
            disabled={isSaving}
            className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-sm shadow-indigo-200 flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSaving ? <Cloud className="w-4 h-4 animate-pulse" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Institutional governance settings successfully persisted across server and local store.</span>
        </div>
      )}

      {/* Form Cards */}
      <div className="space-y-6">
        {/* Card 1: Identity & Academic Unit */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Institutional Identity & Academic Unit
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Institution Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={institution.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Printed on formal syllabus publications and accreditation dossier covers.
              </span>
            </div>

            <div className="sm:col-span-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Institutional Crest / Seal / Logo
              </label>
              <InstitutionalLogoUploader
                currentLogoUrl={institution.logoUrl}
                institutionName={institution.name}
                onLogoChange={(dataUrl) => handleChange('logoUrl', dataUrl)}
                onClearLogo={() => handleChange('logoUrl', '')}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Faculty / School
              </label>
              <input
                type="text"
                value={institution.facultySchool || ''}
                onChange={(e) => handleChange('facultySchool', e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Department
              </label>
              <input
                type="text"
                value={institution.department || ''}
                onChange={(e) => handleChange('department', e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Country / National Jurisdiction
              </label>
              <input
                type="text"
                value={institution.country || 'Pakistan'}
                onChange={(e) => handleChange('country', e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Medium of Instruction (Language)
              </label>
              <input
                type="text"
                value={institution.defaultLanguage || 'English'}
                onChange={(e) => handleChange('defaultLanguage', e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Academic Calendar & Semester Standards */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Academic Calendar & Semester Parameters
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Academic Calendar Type
              </label>
              <select
                value={institution.academicCalendar || 'Semester'}
                onChange={(e) => handleChange('academicCalendar', e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="Semester">Semester (Fall / Spring / Summer)</option>
                <option value="Trimester">Trimester / Quarter</option>
                <option value="Annual">Annual Academic System</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Default Duration in Weeks
              </label>
              <input
                type="number"
                min={4}
                max={24}
                value={institution.defaultCourseDurationWeeks || 16}
                onChange={(e) =>
                  handleChange('defaultCourseDurationWeeks', Number(e.target.value))
                }
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Term Designations
              </label>
              <input
                type="text"
                value={institution.semesterSystem || 'Fall-Spring-Summer'}
                onChange={(e) => handleChange('semesterSystem', e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Default Accreditation & Mapping Policies */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Default Accreditation & OBE Framework
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Default Accreditation Framework
              </label>
              <select
                value={institution.defaultFrameworkId || 'fw-abet-cac'}
                onChange={(e) => handleChange('defaultFrameworkId', e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {INITIAL_FRAMEWORKS.map((fw) => (
                  <option key={fw.id} value={fw.id}>
                    {fw.name} ({fw.code})
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Pre-selected when faculty create new courses in the Course Wizard.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Default Outcome Mapping Scale
              </label>
              <select
                value={institution.defaultMappingScale || 'numeric_1_3'}
                onChange={(e) =>
                  handleChange('defaultMappingScale', e.target.value as OutcomeMappingScale)
                }
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="numeric_1_3">1 - 2 - 3 (NBA India / Numeric Scale)</option>
                <option value="irm">I - R - M (HEC Pakistan / ABET Accord Scale)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cognitive Taxonomy Edition
              </label>
              <input
                type="text"
                value={
                  institution.defaultBloomTaxonomyVersion ||
                  'Revised Bloom (Anderson & Krathwohl, 2001)'
                }
                onChange={(e) => handleChange('defaultBloomTaxonomyVersion', e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
