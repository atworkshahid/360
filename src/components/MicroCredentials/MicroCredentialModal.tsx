import React, { useState, useMemo } from 'react';
import { Course } from '../../types';
import { MicroCredentialBadge, MicroCredentialService } from '../../utils/microCredentialService';
import { MicroCredentialBadgeCard } from './MicroCredentialBadgeCard';
import {
  X,
  Award,
  Download,
  Sparkles,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  FileCode,
  Layers,
  GraduationCap,
  ExternalLink,
} from 'lucide-react';

interface MicroCredentialModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
}

export const MicroCredentialModal: React.FC<MicroCredentialModalProps> = ({
  course,
  isOpen,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBloom, setSelectedBloom] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const badges = useMemo(() => {
    return MicroCredentialService.generateCourseMicroCredentials(course);
  }, [course]);

  const categories = useMemo(() => {
    return Array.from(new Set(badges.map((b) => b.category))).sort();
  }, [badges]);

  const filteredBadges = useMemo(() => {
    return badges.filter((b) => {
      if (selectedBloom !== 'all' && b.bloomLevel !== selectedBloom) return false;
      if (selectedCategory !== 'all' && b.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          b.skillName.toLowerCase().includes(q) ||
          b.id.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [badges, selectedBloom, selectedCategory, searchQuery]);

  const handleDownloadAllJSON = () => {
    const allAssertions = badges.map((b) => b.openBadgeMetadata);
    const jsonStr = JSON.stringify(allAssertions, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${course.code || 'COURSE'}_All_MicroCredentials_OpenBadges.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="p-2.5 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-amber-400">
              <Award className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  OBE Micro-credential Studio
                </span>
                <span className="text-xs text-indigo-300 font-medium">
                  {course.code}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight mt-0.5">
                Masterable Skills Micro-credential Badges
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Filter Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Search skill badges..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 w-44 sm:w-56"
              />
            </div>

            {/* Cognitive Level Filter */}
            <select
              value={selectedBloom}
              onChange={(e) => setSelectedBloom(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Bloom Levels</option>
              <option value="Create">Level 6: Create</option>
              <option value="Evaluate">Level 5: Evaluate</option>
              <option value="Analyze">Level 4: Analyze</option>
              <option value="Apply">Level 3: Apply</option>
              <option value="Understand">Level 2: Understand</option>
              <option value="Remember">Level 1: Remember</option>
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Skill Domains</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-[11px] text-slate-500 font-medium">
              Showing <strong>{filteredBadges.length}</strong> of <strong>{badges.length}</strong> Badges
            </span>

            <button
              type="button"
              onClick={handleDownloadAllJSON}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
              title="Download Open Badges 2.0 assertions for all skills"
            >
              <FileCode className="w-3.5 h-3.5 text-purple-400" />
              <span>Export Open Badges (JSON)</span>
            </button>
          </div>
        </div>

        {/* Badges Grid View */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
          {filteredBadges.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <Award className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
              <p className="text-sm font-semibold text-slate-600">No masterable skill badges matched</p>
              <p className="text-xs text-slate-400">Try changing your search query or cognitive filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredBadges.map((badge) => (
                <MicroCredentialBadgeCard
                  key={badge.id}
                  badge={badge}
                  size="md"
                  showActions={true}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer info banner */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2 text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              Each badge contains an immutable cryptographic verification hash and embeds aligned course CLO evidence.
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer self-end sm:self-auto"
          >
            Close Studio
          </button>
        </div>
      </div>
    </div>
  );
};
