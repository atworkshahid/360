import React from 'react';
import { X, AlertTriangle, CheckCircle2, BookOpen } from 'lucide-react';
import { Course, AuditGap } from '../../types';
import { AuditPdfService } from '../../services/AuditPdfService';

interface AccessibilityAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  gaps: AuditGap[];
  course: Course;
}

export const AccessibilityAuditModal: React.FC<AccessibilityAuditModalProps> = ({
  isOpen,
  onClose,
  gaps,
  course,
}) => {
  if (!isOpen) return null;

  const handleExport = () => {
    AuditPdfService.downloadAuditPDF({
      healthScore: 100, // Dummy
      completionPercentage: 100,
      categoryScores: {} as any,
      criticalCount: gaps.filter(g => g.severity === 'Critical').length,
      highCount: gaps.filter(g => g.severity === 'High').length,
      mediumCount: gaps.filter(g => g.severity === 'Medium').length,
      gaps,
      recommendations: []
    }, course.title);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Accessibility Audit (WCAG 2.1)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-white">
          {gaps.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-900">No accessibility issues detected!</h3>
              <p className="text-xs text-slate-500 mt-1">Your content adheres to accessibility standards.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {gaps.map((gap) => (
                <div key={gap.id} className="pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="flex items-start gap-3 mb-2">
                    <AlertTriangle className={`w-5 h-5 shrink-0 ${
                      gap.severity === 'Critical' ? 'text-rose-600' :
                      gap.severity === 'High' ? 'text-rose-500' :
                      gap.severity === 'Medium' ? 'text-amber-500' : 'text-slate-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-900">{gap.title}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                        <span>{gap.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="uppercase tracking-wide">{gap.severity} Severity</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 mt-1 mb-2 leading-relaxed">{gap.message}</p>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block mb-1">
                      Recommendation
                    </span>
                    <p className="text-xs text-slate-800 font-medium">{gap.recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button
            onClick={handleExport}
            className="px-4 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            Export PDF
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};
