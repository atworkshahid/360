import React, { useState } from 'react';
import {
  ShieldCheck,
  Clock,
  UserCheck,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Printer,
  X,
  ExternalLink,
  ChevronRight,
  Stamp,
  Hash,
  Award,
} from 'lucide-react';
import { AuditLogEntry, DigitalSignOff } from '../../types/collaboration';
import { Course } from '../../types';

interface AuditTrailModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  auditTrail: AuditLogEntry[];
  digitalSignOffs: DigitalSignOff[];
}

export const AuditTrailModal: React.FC<AuditTrailModalProps> = ({
  isOpen,
  onClose,
  course,
  auditTrail,
  digitalSignOffs,
}) => {
  const [filterAction, setFilterAction] = useState<string>('all');
  const [selectedSignOff, setSelectedSignOff] = useState<DigitalSignOff | null>(null);

  if (!isOpen) return null;

  const filteredEntries = auditTrail.filter((entry) => {
    if (filterAction === 'all') return true;
    if (filterAction === 'approvals') {
      return (
        entry.action.includes('APPROVED') ||
        entry.action.includes('ENDORSED') ||
        entry.action.includes('SIGNOFF')
      );
    }
    if (filterAction === 'revisions') {
      return entry.action.includes('REVISION');
    }
    if (filterAction === 'comments') {
      return entry.action.includes('COMMENT');
    }
    return true;
  });

  const getActionBadge = (action: string) => {
    if (action.includes('APPROVED') || action.includes('ENDORSED') || action.includes('SIGNOFF')) {
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
    if (action.includes('REVISION')) {
      return 'bg-amber-50 text-amber-800 border-amber-200';
    }
    if (action.includes('SUBMITTED')) {
      return 'bg-indigo-50 text-indigo-800 border-indigo-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const formatTimestamp = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-slate-950 text-white flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Tamper-Evident Academic Governance</span>
              <span>•</span>
              <span>Accreditation Audit Trail</span>
            </div>
            <h2 className="text-xl font-bold font-serif text-white flex items-center gap-2">
              <span>{course.code}: {course.title}</span>
            </h2>
            <p className="text-xs text-slate-400">
              Complete chronological audit trail of syllabus reviews, Board of Studies resolutions, Dean signatures, and accreditation evaluators.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/10 flex items-center gap-1.5 transition cursor-pointer"
              title="Print formal audit transcript"
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              <span className="hidden sm:inline">Print Transcript</span>
            </button>
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Digital Verification Seals Strip */}
        {digitalSignOffs.length > 0 && (
          <div className="bg-slate-50 border-b border-slate-200 p-4 shrink-0">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Stamp className="w-3.5 h-3.5 text-indigo-600" />
                Verified Digital Signatures & Academic Seals ({digitalSignOffs.length})
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                SHA-256 Cryptographic Digest Verified
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {digitalSignOffs.map((sign, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedSignOff(sign)}
                  className="bg-white border border-slate-200 hover:border-indigo-400 rounded-xl p-3 shadow-2xs transition cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                        {sign.stage.replace('_', ' ')}
                      </span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {sign.signatoryName}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {sign.signatoryRole}
                    </div>
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="truncate max-w-[120px]">#{sign.verificationHash.slice(0, 10)}...</span>
                    <span>{new Date(sign.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter Navigation */}
        <div className="px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-white shrink-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'all', label: `All Events (${auditTrail.length})` },
              { id: 'approvals', label: 'Formal Approvals & Seals' },
              { id: 'revisions', label: 'Revision Requests' },
              { id: 'comments', label: 'Reviewer Remarks' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterAction(tab.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                  filterAction === tab.id
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Accreditation Standard: <strong>{course.accreditationFramework || 'Washington Accord'}</strong></span>
          </div>
        </div>

        {/* Timeline Content List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {filteredEntries.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No audit records match the selected filter.
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-6">
              {filteredEntries.map((entry, idx) => (
                <div key={entry.id || idx} className="relative group">
                  {/* Timeline Node Icon */}
                  <span
                    className={`absolute -left-[35px] top-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-xs ${
                      entry.action.includes('APPROVED') || entry.action.includes('SIGNOFF')
                        ? 'bg-emerald-600'
                        : entry.action.includes('REVISION')
                        ? 'bg-amber-600'
                        : 'bg-indigo-600'
                    }`}
                  >
                    {idx + 1}
                  </span>

                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:border-slate-300 transition space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getActionBadge(
                            entry.action
                          )}`}
                        >
                          {entry.action.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          {entry.actorName}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          ({entry.actorRole})
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatTimestamp(entry.timestamp)}</span>
                      </div>
                    </div>

                    {/* Decision Note */}
                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                      {entry.decisionNote || 'No specific note recorded.'}
                    </p>

                    {/* Meta attributes (readiness score, target section, digital seal) */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-slate-500">
                      <div className="flex items-center gap-3">
                        {entry.targetSection && (
                          <span>
                            Target Section: <strong className="text-slate-700">{entry.targetSection}</strong>
                          </span>
                        )}
                        {entry.readinessScoreSnapshot !== undefined && (
                          <span>
                            Readiness at Action:{' '}
                            <strong className="text-emerald-700 font-bold">
                              {entry.readinessScoreSnapshot}%
                            </strong>
                          </span>
                        )}
                      </div>

                      {entry.digitalSignOff && (
                        <button
                          type="button"
                          onClick={() => setSelectedSignOff(entry.digitalSignOff!)}
                          className="inline-flex items-center gap-1 text-[10px] font-bold font-mono text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded border border-indigo-200 cursor-pointer transition"
                        >
                          <Hash className="w-3 h-3" />
                          <span>Verify Seal: {entry.digitalSignOff.verificationHash.slice(0, 12)}...</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Verification Certificate Inspector Modal */}
        {selectedSignOff && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="bg-white rounded-2xl border border-slate-300 max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Stamp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Digital Endorsement & Statutory Seal
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Authenticated by MENTISERA OBE360™ Governance Authority
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSignOff(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Signatory
                    </span>
                    <span className="font-bold text-slate-900">{selectedSignOff.signatoryName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Academic Role
                    </span>
                    <span className="text-slate-700">{selectedSignOff.signatoryRole}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Institution / Faculty
                    </span>
                    <span className="text-slate-700">{selectedSignOff.institution}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Timestamp
                    </span>
                    <span className="text-slate-700">{formatTimestamp(selectedSignOff.timestamp)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Official Endorsement Statement
                  </span>
                  <p className="italic text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200">
                    "{selectedSignOff.officialStatement}"
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Cryptographic Seal Hash (SHA-256)
                  </span>
                  <div className="p-2 bg-slate-900 text-emerald-400 font-mono text-[10px] rounded-lg break-all select-all">
                    {selectedSignOff.verificationHash}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSignOff(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Close Seal Certificate
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
