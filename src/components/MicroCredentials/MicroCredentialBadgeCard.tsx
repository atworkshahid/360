import React, { useState } from 'react';
import { MicroCredentialBadge, MicroCredentialService } from '../../utils/microCredentialService';
import {
  Award,
  Download,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  FileCode,
  Copy,
  Check,
  X,
  Target,
  Layers,
} from 'lucide-react';

interface MicroCredentialBadgeCardProps {
  badge: MicroCredentialBadge;
  onInspect?: (badge: MicroCredentialBadge) => void;
  size?: 'sm' | 'md' | 'lg';
  showActions?: boolean;
}

export const MicroCredentialBadgeCard: React.FC<MicroCredentialBadgeCardProps> = ({
  badge,
  onInspect,
  size = 'md',
  showActions = true,
}) => {
  const [copied, setCopied] = useState(false);
  const [inspectOpen, setInspectOpen] = useState(false);

  const handleCopyHash = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(badge.verificationHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSVG = (e: React.MouseEvent) => {
    e.stopPropagation();
    MicroCredentialService.downloadBadgeSVG(badge);
  };

  const handleDownloadJSON = (e: React.MouseEvent) => {
    e.stopPropagation();
    MicroCredentialService.downloadOpenBadgeJSON(badge);
  };

  const cardPadding = size === 'sm' ? 'p-3' : size === 'lg' ? 'p-6' : 'p-4';
  const badgeWidth = size === 'sm' ? 'w-24 h-28' : size === 'lg' ? 'w-44 h-52' : 'w-32 h-36';

  return (
    <>
      <div
        onClick={() => {
          if (onInspect) onInspect(badge);
          else setInspectOpen(true);
        }}
        className={`group bg-white rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-lg transition-all duration-300 flex flex-col justify-between items-center text-center cursor-pointer relative overflow-hidden ${cardPadding}`}
      >
        {/* Top subtle highlight */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Cognitive Level Tag & Shape Indicator */}
        <div className="w-full flex items-center justify-between text-[10px] text-slate-500 pb-2 border-b border-slate-100">
          <span className="font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
            {badge.id}
          </span>
          <span
            className={`font-black uppercase tracking-wider px-2 py-0.2 rounded-full border text-[9px] ${badge.theme.badgeBg} ${badge.theme.textColor}`}
          >
            L{badge.bloomRank} {badge.bloomLevel}
          </span>
        </div>

        {/* Visual Badge Artwork */}
        <div className={`my-2 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shrink-0 ${badgeWidth}`}>
          <img
            src={badge.svgDataUri}
            alt={`${badge.skillName} Micro-credential Badge`}
            className="w-full h-full object-contain filter drop-shadow-sm select-none"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Badge Skill Title & Category */}
        <div className="space-y-1 w-full pt-1">
          <h4 className="font-bold text-slate-900 text-xs line-clamp-1 group-hover:text-indigo-600 transition-colors" title={badge.skillName}>
            {badge.skillName}
          </h4>
          <p className="text-[10px] text-slate-500 font-medium">
            {badge.category} • {badge.courseCode}
          </p>
        </div>

        {/* Verification Footer & Action Buttons */}
        {showActions && (
          <div className="w-full mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-1 text-[11px]">
            <button
              type="button"
              onClick={handleCopyHash}
              className="text-[9px] font-mono text-slate-400 hover:text-slate-700 flex items-center space-x-1 p-1 rounded hover:bg-slate-100 transition"
              title={`Verification Hash: ${badge.verificationHash}`}
            >
              {copied ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <Copy className="w-2.5 h-2.5" />}
              <span>{copied ? 'Copied' : badge.verificationHash.substring(0, 8)}...</span>
            </button>

            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={handleDownloadSVG}
                className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                title="Download Badge Vector (SVG)"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleDownloadJSON}
                className="p-1 rounded text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition"
                title="Export Open Badges JSON Assertion"
              >
                <FileCode className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Standalone Inspection Dialog */}
      {inspectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-6 animate-in zoom-in-95 relative">
            <button
              type="button"
              onClick={() => setInspectOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center space-x-3 pr-8">
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
                <ShieldCheck className="w-6 h-6" />
              </span>
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  Official Micro-credential Assertion
                </span>
                <h3 className="text-base font-bold text-slate-900">{badge.skillName}</h3>
              </div>
            </div>

            {/* Badge Large Display */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-32 h-36 shrink-0">
                <img
                  src={badge.svgDataUri}
                  alt={badge.skillName}
                  className="w-full h-full object-contain filter drop-shadow-md"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="space-y-1.5 text-xs text-left flex-1">
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-slate-700">Course:</span>
                  <span className="text-slate-900 font-semibold">{badge.courseCode} ({badge.courseTitle})</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-slate-700">Cognitive Tier:</span>
                  <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-indigo-100 text-indigo-800">
                    Bloom Level {badge.bloomRank} ({badge.bloomLevel})
                  </span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-slate-700">Issuer:</span>
                  <span className="text-slate-600">{badge.institutionName} • {badge.issuerDepartment}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-slate-700">Issue Date:</span>
                  <span className="text-slate-600">{badge.issueDate}</span>
                </div>
              </div>
            </div>

            {/* Criteria & CLOs */}
            <div className="space-y-3 text-xs text-left">
              <div>
                <span className="font-bold text-slate-800 block mb-1 flex items-center space-x-1">
                  <Target className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Mastery Criteria</span>
                </span>
                <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {badge.criteria}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-800 block mb-1 flex items-center space-x-1">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Aligned Learning Outcomes</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {badge.linkedCLOCodes.map((code) => (
                    <span
                      key={code}
                      className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-800 font-mono font-bold rounded-lg text-[11px]"
                    >
                      {code}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-800 block mb-1">Cryptographic Verification Hash</span>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px]">
                  <span>{badge.verificationHash}</span>
                  <button
                    type="button"
                    onClick={handleCopyHash}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[10px] text-slate-400 font-medium">
                Standard: Open Badges 2.0 / 3.0 Compatible
              </span>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleDownloadJSON}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer flex items-center space-x-1"
                >
                  <FileCode className="w-3.5 h-3.5 text-purple-600" />
                  <span>Export JSON</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadSVG}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer flex items-center space-x-1 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download SVG</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
