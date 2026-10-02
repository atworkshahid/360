import React, { useState } from 'react';
import {
  Languages,
  X,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Copy,
  RefreshCw,
  Globe2,
  BookOpen,
  Layers,
  FileText,
} from 'lucide-react';
import { Course, CourseLanguage, SUPPORTED_LANGUAGES } from '../../types';
import {
  translateCourse,
  isRtlLanguage,
  getLocalizedBloomsVerbs,
  TranslationResult,
} from '../../services/courseTranslationService';

interface CourseTranslationModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  onCourseUpdated: (updatedCourse: Course) => void;
  onCourseCreated?: (newCourse: Course) => void;
  initialTargetLanguage?: CourseLanguage;
}

export const CourseTranslationModal: React.FC<CourseTranslationModalProps> = ({
  isOpen,
  onClose,
  course,
  onCourseUpdated,
  onCourseCreated,
  initialTargetLanguage,
}) => {
  const currentLang = (course.language as CourseLanguage) || 'English';
  const defaultTarget = initialTargetLanguage || (currentLang === 'English' ? 'Arabic' : 'English');

  const [targetLanguage, setTargetLanguage] = useState<CourseLanguage>(defaultTarget);
  const [scope, setScope] = useState<'full' | 'outcomes_only'>('full');
  const [createCopy, setCreateCopy] = useState<boolean>(false);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialTargetLanguage) {
      setTargetLanguage(initialTargetLanguage);
    }
  }, [initialTargetLanguage, isOpen]);

  if (!isOpen) return null;

  const isTargetRtl = isRtlLanguage(targetLanguage);
  const targetOption = SUPPORTED_LANGUAGES.find((l) => l.name === targetLanguage);
  const bloomsVerbs = getLocalizedBloomsVerbs(targetLanguage);

  const handleTranslate = async () => {
    setIsTranslating(true);
    setErrorMessage(null);
    setResult(null);

    try {
      const res = await translateCourse(course, targetLanguage, {
        scope,
        createNewCourseCopy: createCopy,
        newTitle: createCopy
          ? `${course.title} (${targetLanguage === 'Arabic' ? 'النسخة العربية' : targetLanguage === 'Urdu' ? 'اردو ایڈیشن' : targetLanguage + ' Edition'})`
          : undefined,
        newCode: createCopy ? `${course.code}-${targetLanguage.substring(0, 2).toUpperCase()}` : undefined,
      });

      setResult(res);

      if (createCopy && onCourseCreated) {
        onCourseCreated(res.translatedCourse);
      } else {
        onCourseUpdated(res.translatedCourse);
      }

      // Synchronize application UI language and text direction
      window.dispatchEvent(
        new CustomEvent('language_changed', {
          detail: { language: res.targetLanguage, dir: res.textDirection },
        })
      );
    } catch (err) {
      setErrorMessage((err as Error).message || 'Translation process encountered an issue.');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Languages className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base text-white">Course Translation & Localization</h3>
                <span className="bg-indigo-500/30 text-indigo-200 text-[10px] font-mono px-2 py-0.5 rounded-full border border-indigo-400/30">
                  OBE Multilingual
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5">
                Translate curriculum specifications with accredited pedagogical taxonomy preservation
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 text-xs">
          {/* Source & Target language cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                Source Language
              </span>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-800">{currentLang}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-600 uppercase">
                  {course.textDirection?.toUpperCase() || 'LTR'}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1 truncate">
                {course.title} ({course.code})
              </div>
            </div>

            <div className="p-3.5 rounded-xl border-2 border-indigo-500 bg-indigo-50/40">
              <span className="text-[10px] font-bold uppercase text-indigo-600 tracking-wider block mb-1">
                Target Language
              </span>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-base">{targetOption?.flag}</span>
                  <span className="font-bold text-sm text-indigo-950">{targetLanguage}</span>
                  <span className="text-xs text-indigo-600 font-medium">({targetOption?.nativeName})</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    isTargetRtl
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-indigo-100 text-indigo-800'
                  }`}
                >
                  {isTargetRtl ? 'RTL Layout' : 'LTR Layout'}
                </span>
              </div>
              <div className="text-[10px] text-indigo-700/80 mt-1">
                {isTargetRtl
                  ? 'Right-to-Left formatting will be applied to the curriculum document.'
                  : 'Standard Left-to-Right layout will be maintained.'}
              </div>
            </div>
          </div>

          {/* Target Language Selection Pills */}
          <div>
            <label className="block font-bold text-slate-700 mb-2">
              Select Desired Language:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = lang.name === targetLanguage;
                const isSource = lang.name === currentLang;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    disabled={isSource}
                    onClick={() => setTargetLanguage(lang.name)}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                      isSource
                        ? 'opacity-40 bg-slate-100 border-slate-200 cursor-not-allowed'
                        : isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 text-indigo-950 font-bold'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-lg leading-none">{lang.flag}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          lang.dir === 'rtl' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {lang.dir.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">{lang.nativeName}</div>
                      <div className="text-[10px] text-slate-500">{lang.name}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Translation Scope Selection */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-700">Translation Scope</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label
                className={`p-3 rounded-xl border cursor-pointer flex items-start space-x-3 transition ${
                  scope === 'full'
                    ? 'border-indigo-600 bg-indigo-50/30 ring-1 ring-indigo-500'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="translationScope"
                  checked={scope === 'full'}
                  onChange={() => setScope('full')}
                  className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="font-bold text-slate-900 block">Full Course Specification</span>
                  <span className="text-[11px] text-slate-500 leading-relaxed block mt-0.5">
                    Translates Overview, Purpose, CLOs, PLOs, Modules, Weekly Plan, Assessments, and Rubrics.
                  </span>
                </div>
              </label>

              <label
                className={`p-3 rounded-xl border cursor-pointer flex items-start space-x-3 transition ${
                  scope === 'outcomes_only'
                    ? 'border-indigo-600 bg-indigo-50/30 ring-1 ring-indigo-500'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="translationScope"
                  checked={scope === 'outcomes_only'}
                  onChange={() => setScope('outcomes_only')}
                  className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="font-bold text-slate-900 block">Outcomes & Assessments Only</span>
                  <span className="text-[11px] text-slate-500 leading-relaxed block mt-0.5">
                    Translates CLOs, Bloom's action verbs, and assessment titles while keeping overall metadata.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Output Destination Selection */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/80 space-y-2">
            <span className="font-bold text-slate-700 block">Course Copy Destination</span>
            <div className="flex flex-col sm:flex-row gap-3">
              <label className="flex items-center space-x-2 text-xs font-medium cursor-pointer">
                <input
                  type="radio"
                  name="destinationOption"
                  checked={createCopy}
                  onChange={() => setCreateCopy(true)}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span>Create a new translated course (Recommended)</span>
              </label>
              <label className="flex items-center space-x-2 text-xs font-medium cursor-pointer">
                <input
                  type="radio"
                  name="destinationOption"
                  checked={!createCopy}
                  onChange={() => setCreateCopy(false)}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span>Update active course directly</span>
              </label>
            </div>
            {createCopy && (
              <p className="text-[11px] text-slate-500">
                A new course named <span className="font-mono text-indigo-700 font-semibold">{course.title} ({targetLanguage} Edition)</span> will be added to your curriculum portfolio.
              </p>
            )}
          </div>

          {/* Pedagogical Fidelity Safeguard Notice */}
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <span className="font-bold block">Accredited OBE Constructive Alignment Safeguard</span>
              Cognitive levels (Bloom C1–C6), CLO-to-PLO numerical matrix linkages (1-3 scale), assessment weights, and credit hour calculations will remain strictly preserved during localization.
            </div>
          </div>

          {/* Result Alert */}
          {result && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Course Successfully Localized into {result.targetLanguage}!</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800 font-mono">
                  {result.method === 'gemini_ai' ? 'Gemini 3.8 Flash AI' : 'OBE Pedagogical Engine'}
                </span>
              </div>
              <p className="text-[11px] text-emerald-800">
                {result.translatedFieldCount} curriculum elements and taxonomy descriptors were translated and aligned. Layout direction is set to{' '}
                <span className="font-bold uppercase">{result.textDirection}</span>.
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center space-x-2 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition cursor-pointer"
          >
            {result ? 'Close' : 'Cancel'}
          </button>

          <button
            type="button"
            disabled={isTranslating || targetLanguage === currentLang}
            onClick={handleTranslate}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition flex items-center space-x-2 shadow-sm cursor-pointer ${
              isTranslating || targetLanguage === currentLang
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
            }`}
          >
            {isTranslating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Translating with OBE Fidelity...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                <span>Localize Course to {targetLanguage}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
