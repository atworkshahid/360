import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Check,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  ArrowUpToLine,
  ArrowDownToLine,
  GripVertical,
  Plus,
  RotateCcw,
  Sparkles,
  Layers,
  AlertTriangle,
  CheckCircle2,
  SlidersHorizontal,
  Search,
  Hash,
  Scale,
  Brain,
  HelpCircle,
} from 'lucide-react';
import { CLO, BloomLevel, LearningDomain, CLOStatus } from '../../types';
import { BLOOM_TAXONOMY_DATA } from './BloomsTaxonomyHelperModal';

interface CLOBulkEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  clos: CLO[];
  onSave: (updatedCLOs: CLO[]) => void;
  courseTitle?: string;
}

export const CLOBulkEditorModal: React.FC<CLOBulkEditorModalProps> = ({
  isOpen,
  onClose,
  clos,
  onSave,
  courseTitle = 'Course',
}) => {
  // Working local state so users can reorder/duplicate/delete with undo/cancel safety
  const [draftCLOs, setDraftCLOs] = useState<CLO[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [bloomFilter, setBloomFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'selected'>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Deep clone incoming CLOs
      setDraftCLOs(JSON.parse(JSON.stringify(clos || [])));
      setSelectedIds(new Set());
      setSearchQuery('');
      setBloomFilter('all');
      setShowDeleteConfirm(false);
      setToastMessage(null);
    }
  }, [isOpen, clos]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered views
  const visibleCLOs = useMemo(() => {
    return draftCLOs.filter((clo) => {
      if (activeTab === 'selected' && !selectedIds.has(clo.id)) {
        return false;
      }
      if (bloomFilter !== 'all' && clo.bloomLevel !== bloomFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesCode = (clo.code || '').toLowerCase().includes(query);
        const matchesStatement = (clo.statement || '').toLowerCase().includes(query);
        const matchesVerb = (clo.bloomVerb || '').toLowerCase().includes(query);
        if (!matchesCode && !matchesStatement && !matchesVerb) {
          return false;
        }
      }
      return true;
    });
  }, [draftCLOs, selectedIds, activeTab, bloomFilter, searchQuery]);

  // Statistics
  const totalWeightage = useMemo(() => {
    return draftCLOs.reduce((acc, c) => acc + (Number(c.weightage) || 0), 0);
  }, [draftCLOs]);

  const higherOrderCount = useMemo(() => {
    return draftCLOs.filter((c) =>
      ['Analyze', 'Evaluate', 'Create'].includes(c.bloomLevel)
    ).length;
  }, [draftCLOs]);

  const higherOrderPercentage = draftCLOs.length > 0
    ? Math.round((higherOrderCount / draftCLOs.length) * 100)
    : 0;

  // Selection handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.size === visibleCLOs.length && visibleCLOs.length > 0) {
      setSelectedIds(new Set());
    } else {
      const newSelected = new Set(selectedIds);
      visibleCLOs.forEach((c) => newSelected.add(c.id));
      setSelectedIds(newSelected);
    }
  };

  const handleToggleSelectRow = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = new Set(selectedIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedIds(updated);
  };

  // Row update helper
  const handleUpdateDraftCLO = (id: string, updates: Partial<CLO>) => {
    setDraftCLOs((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  // Reorder Operations
  const handleMove = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= draftCLOs.length || fromIndex === toIndex) return;
    const updated = [...draftCLOs];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setDraftCLOs(updated);
  };

  const handleMoveToTop = (index: number) => {
    handleMove(index, 0);
  };

  const handleMoveToBottom = (index: number) => {
    handleMove(index, draftCLOs.length - 1);
  };

  // Drag & drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      handleMove(draggedIndex, dragOverIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Single Item Duplicate
  const handleDuplicateSingle = (cloId: string) => {
    const targetIdx = draftCLOs.findIndex((c) => c.id === cloId);
    if (targetIdx === -1) return;
    const original = draftCLOs[targetIdx];
    const newId = `clo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const cloned: CLO = {
      ...original,
      id: newId,
      code: `${original.code} (Copy)`,
      status: 'Draft',
      mappedPLOs: original.mappedPLOs ? [...original.mappedPLOs] : [],
      qualityChecks: original.qualityChecks ? [...original.qualityChecks] : [],
    };
    const updated = [...draftCLOs];
    updated.splice(targetIdx + 1, 0, cloned);
    setDraftCLOs(updated);
    showToast(`Duplicated ${original.code}`);
  };

  // Bulk Duplicate
  const handleBulkDuplicate = () => {
    if (selectedIds.size === 0) return;
    const toDuplicate = draftCLOs.filter((c) => selectedIds.has(c.id));
    if (toDuplicate.length === 0) return;

    const clonedItems: CLO[] = toDuplicate.map((orig, i) => {
      const newId = `clo-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`;
      return {
        ...orig,
        id: newId,
        code: `${orig.code} (Copy)`,
        status: 'Draft',
        mappedPLOs: orig.mappedPLOs ? [...orig.mappedPLOs] : [],
        qualityChecks: orig.qualityChecks ? [...orig.qualityChecks] : [],
      };
    });

    const updated = [...draftCLOs, ...clonedItems];
    setDraftCLOs(updated);

    // Select the newly duplicated items
    const newSelected = new Set(clonedItems.map((c) => c.id));
    setSelectedIds(newSelected);
    showToast(`Successfully duplicated ${clonedItems.length} Course Learning Outcome(s)`);
  };

  // Single Delete
  const handleDeleteSingle = (cloId: string) => {
    if (draftCLOs.length <= 1) {
      alert('A course must retain at least one Course Learning Outcome (CLO).');
      return;
    }
    const updated = draftCLOs.filter((c) => c.id !== cloId);
    setDraftCLOs(updated);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(cloId);
      return next;
    });
    showToast('Outcome removed.');
  };

  // Bulk Delete
  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    const remainingCount = draftCLOs.length - selectedIds.size;
    if (remainingCount < 1) {
      alert('Cannot delete all outcomes. A course must have at least one Course Learning Outcome.');
      return;
    }
    const updated = draftCLOs.filter((c) => !selectedIds.has(c.id));
    setDraftCLOs(updated);
    const countDeleted = selectedIds.size;
    setSelectedIds(new Set());
    setShowDeleteConfirm(false);
    showToast(`Deleted ${countDeleted} outcome(s).`);
  };

  // Bulk Renumber Codes
  const handleRenumberCodes = () => {
    const updated = draftCLOs.map((c, idx) => ({
      ...c,
      code: `CLO ${idx + 1}`,
    }));
    setDraftCLOs(updated);
    showToast(`Renumbered ${updated.length} outcomes sequentially (CLO 1 – CLO ${updated.length})`);
  };

  // Equalize Weightages
  const handleEqualizeWeightages = () => {
    if (draftCLOs.length === 0) return;
    const base = Math.floor(100 / draftCLOs.length);
    const remainder = 100 - base * draftCLOs.length;
    const updated = draftCLOs.map((c, idx) => ({
      ...c,
      weightage: idx === 0 ? base + remainder : base,
    }));
    setDraftCLOs(updated);
    showToast(`Weightages equalized across ${draftCLOs.length} outcomes totaling 100%`);
  };

  // Bulk Assign Bloom Level
  const handleBulkAssignBloom = (level: BloomLevel) => {
    if (selectedIds.size === 0) return;
    const defaultVerb = BLOOM_TAXONOMY_DATA[level]?.categories[0]?.verbs[0] || level;
    const updated = draftCLOs.map((c) => {
      if (selectedIds.has(c.id)) {
        return {
          ...c,
          bloomLevel: level,
          bloomVerb: defaultVerb,
        };
      }
      return c;
    });
    setDraftCLOs(updated);
    showToast(`Set ${selectedIds.size} outcome(s) to Bloom's Level: ${level}`);
  };

  // Bulk Assign Status
  const handleBulkAssignStatus = (status: CLOStatus) => {
    if (selectedIds.size === 0) return;
    const updated = draftCLOs.map((c) => {
      if (selectedIds.has(c.id)) {
        return {
          ...c,
          status,
        };
      }
      return c;
    });
    setDraftCLOs(updated);
    showToast(`Set status of ${selectedIds.size} outcome(s) to ${status}`);
  };

  // Add New Outcome
  const handleAddNewOutcome = () => {
    const nextNum = draftCLOs.length + 1;
    const newCLO: CLO = {
      id: `clo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      code: `CLO ${nextNum}`,
      statement: `Analyze and evaluate domain principles in ${courseTitle}.`,
      bloomVerb: 'Analyze',
      bloomLevel: 'Analyze',
      learningDomain: 'Cognitive',
      competency: 'Core Discipline Competency',
      skills: 'Critical analysis and systematic problem solving',
      assessmentMethod: 'Assignment / Analytical Project',
      achievementThreshold: 60,
      weightage: draftCLOs.length === 0 ? 100 : Math.max(0, 100 - totalWeightage),
      status: 'Draft',
      qualityScore: 82,
      qualityChecks: [],
      mappedPLOs: [],
    };
    setDraftCLOs([...draftCLOs, newCLO]);
    showToast(`Added ${newCLO.code}`);
  };

  // Save / Apply
  const handleSave = () => {
    if (draftCLOs.length === 0) {
      alert('You must have at least one CLO before saving.');
      return;
    }
    onSave(draftCLOs);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="clo-bulk-editor-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shadow-2xs">
              <Layers className="w-5 h-5 text-indigo-700" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-900">
                  Course Learning Outcomes (CLO) Bulk Editor
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-xs font-bold font-mono">
                  {draftCLOs.length} Outcomes
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Reorder sequence, duplicate outcomes, or batch delete and calibrate multiple CLOs simultaneously.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="mx-6 mt-3 px-3.5 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900"
            >
              ×
            </button>
          </div>
        )}

        {/* Toolbar & Filter Bar */}
        <div className="px-6 py-3 border-b border-slate-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {/* Search */}
            <div className="relative min-w-[200px] flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search outcomes by code or verb..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Bloom Filter */}
            <select
              value={bloomFilter}
              onChange={(e) => setBloomFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Bloom Levels</option>
              <option value="Remember">Remember (L1)</option>
              <option value="Understand">Understand (L2)</option>
              <option value="Apply">Apply (L3)</option>
              <option value="Analyze">Analyze (L4)</option>
              <option value="Evaluate">Evaluate (L5)</option>
              <option value="Create">Create (L6)</option>
            </select>

            {/* View tabs */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({draftCLOs.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('selected')}
                className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                  activeTab === 'selected'
                    ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Selected ({selectedIds.size})
              </button>
            </div>
          </div>

          {/* Quick Sequence Utility Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleRenumberCodes}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center space-x-1.5 transition cursor-pointer"
              title="Renumber outcome codes sequentially (CLO 1, CLO 2, CLO 3...)"
            >
              <Hash className="w-3.5 h-3.5 text-indigo-600" />
              <span>Auto-Renumber</span>
            </button>

            <button
              type="button"
              onClick={handleEqualizeWeightages}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center space-x-1.5 transition cursor-pointer"
              title="Equally split 100% course weightage across all outcomes"
            >
              <Scale className="w-3.5 h-3.5 text-emerald-600" />
              <span>Equalize Weights</span>
            </button>

            <button
              type="button"
              onClick={handleAddNewOutcome}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Outcome</span>
            </button>
          </div>
        </div>

        {/* Sticky Bulk Selection Actions Banner */}
        {selectedIds.size > 0 && (
          <div className="px-6 py-2.5 bg-indigo-50 border-b border-indigo-200 flex flex-wrap items-center justify-between gap-3 text-xs animate-in slide-in-from-top-1">
            <div className="flex items-center space-x-2.5">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-2xs">
                {selectedIds.size}
              </span>
              <span className="font-bold text-indigo-950">
                {selectedIds.size} Course Learning Outcome{selectedIds.size > 1 ? 's' : ''} Selected
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Duplicate Selected */}
              <button
                type="button"
                id="clo-bulk-duplicate-btn"
                onClick={handleBulkDuplicate}
                className="px-3 py-1.5 rounded-lg bg-white border border-indigo-300 text-indigo-800 hover:bg-indigo-100 font-bold flex items-center space-x-1.5 shadow-2xs transition cursor-pointer"
                title="Duplicate all checked Course Learning Outcomes"
              >
                <Copy className="w-3.5 h-3.5 text-indigo-600" />
                <span>Duplicate Selected ({selectedIds.size})</span>
              </button>

              {/* Set Bloom Level for Selected */}
              <div className="flex items-center space-x-1 bg-white border border-slate-300 rounded-lg px-2 py-1">
                <Brain className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-[11px] font-semibold text-slate-600">Set Bloom:</span>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBulkAssignBloom(e.target.value as BloomLevel);
                      e.target.value = '';
                    }
                  }}
                  defaultValue=""
                  className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="" disabled>
                    Choose Level...
                  </option>
                  <option value="Remember">Remember (L1)</option>
                  <option value="Understand">Understand (L2)</option>
                  <option value="Apply">Apply (L3)</option>
                  <option value="Analyze">Analyze (L4)</option>
                  <option value="Evaluate">Evaluate (L5)</option>
                  <option value="Create">Create (L6)</option>
                </select>
              </div>

              {/* Set Status for Selected */}
              <div className="flex items-center space-x-1 bg-white border border-slate-300 rounded-lg px-2 py-1">
                <span className="text-[11px] font-semibold text-slate-600">Status:</span>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBulkAssignStatus(e.target.value as CLOStatus);
                      e.target.value = '';
                    }
                  }}
                  defaultValue=""
                  className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="" disabled>
                    Set Status...
                  </option>
                  <option value="Draft">Draft</option>
                  <option value="Validated">Validated</option>
                  <option value="Flagged">Flagged</option>
                </select>
              </div>

              {/* Delete Selected */}
              {showDeleteConfirm ? (
                <div className="flex items-center space-x-1.5 bg-rose-50 border border-rose-300 rounded-lg px-2 py-1">
                  <span className="text-xs font-bold text-rose-800">
                    Delete {selectedIds.size} CLO{selectedIds.size > 1 ? 's' : ''}?
                  </span>
                  <button
                    type="button"
                    onClick={handleBulkDelete}
                    className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold text-xs hover:bg-rose-700"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-2 py-0.5 rounded bg-white text-slate-600 text-xs hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  id="clo-bulk-delete-btn"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 hover:bg-rose-100 font-bold flex items-center space-x-1.5 shadow-2xs transition cursor-pointer"
                  title="Delete all selected outcomes"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Delete Selected ({selectedIds.size})</span>
                </button>
              )}

              {/* Deselect All */}
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="text-xs text-indigo-700 hover:text-indigo-900 font-semibold px-2 py-1"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

        {/* CLO List Body */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {/* Header Row */}
          <div className="flex items-center px-4 py-2 bg-slate-100 rounded-xl text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <div className="w-8 flex items-center justify-center">
              <input
                type="checkbox"
                checked={visibleCLOs.length > 0 && selectedIds.size === visibleCLOs.length}
                onChange={handleToggleSelectAll}
                className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                title="Select / Deselect all visible outcomes"
              />
            </div>
            <div className="w-10 text-center">#</div>
            <div className="w-24 text-center">Order</div>
            <div className="w-28 pl-2">Code</div>
            <div className="w-36 pl-2">Bloom Rigor</div>
            <div className="flex-1 px-3">Measurable Outcome Statement</div>
            <div className="w-24 text-center">Weight %</div>
            <div className="w-28 text-center">Actions</div>
          </div>

          {visibleCLOs.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-2">
              <Layers className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="text-xs font-bold text-slate-700">No outcomes found matching the filter</div>
              <p className="text-[11px] text-slate-400">
                Clear the search query or active filter to view all course learning outcomes.
              </p>
            </div>
          ) : (
            visibleCLOs.map((clo, index) => {
              const fullListIndex = draftCLOs.findIndex((c) => c.id === clo.id);
              const isSelected = selectedIds.has(clo.id);
              const isFirst = fullListIndex === 0;
              const isLast = fullListIndex === draftCLOs.length - 1;
              const isDraggingThis = draggedIndex === fullListIndex;
              const isDragOverThis = dragOverIndex === fullListIndex;

              return (
                <div
                  key={clo.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, fullListIndex)}
                  onDragOver={(e) => handleDragOver(e, fullListIndex)}
                  onDragEnd={handleDragEnd}
                  className={`flex flex-col sm:flex-row sm:items-center px-4 py-3 rounded-xl border transition-all ${
                    isDraggingThis
                      ? 'opacity-40 border-dashed border-indigo-400 bg-indigo-50/50'
                      : isDragOverThis
                      ? 'border-indigo-600 bg-indigo-50/70 shadow-sm'
                      : isSelected
                      ? 'border-indigo-500 bg-indigo-50/40 shadow-2xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                    {/* Checkbox */}
                    <div className="w-8 flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectRow(clo.id)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </div>

                    {/* Drag Handle & Position Index */}
                    <div
                      className="w-10 flex items-center justify-center text-slate-400 font-mono font-bold text-xs cursor-grab active:cursor-grabbing"
                      title="Drag to reorder"
                    >
                      <GripVertical className="w-3.5 h-3.5 text-slate-300 mr-0.5" />
                      <span>#{fullListIndex + 1}</span>
                    </div>

                    {/* Order buttons */}
                    <div className="w-24 flex items-center justify-center space-x-1">
                      <button
                        type="button"
                        onClick={() => handleMove(fullListIndex, fullListIndex - 1)}
                        disabled={isFirst}
                        className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(fullListIndex, fullListIndex + 1)}
                        disabled={isLast}
                        className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveToTop(fullListIndex)}
                        disabled={isFirst}
                        className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                        title="Move to Top"
                      >
                        <ArrowUpToLine className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveToBottom(fullListIndex)}
                        disabled={isLast}
                        className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                        title="Move to Bottom"
                      >
                        <ArrowDownToLine className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Code Input */}
                    <div className="w-28 pl-2">
                      <input
                        type="text"
                        value={clo.code}
                        onChange={(e) => handleUpdateDraftCLO(clo.id, { code: e.target.value })}
                        className="w-full px-2 py-1 text-xs font-mono font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                        placeholder="CLO 1"
                      />
                    </div>
                  </div>

                  {/* Bloom Selector */}
                  <div className="w-full sm:w-36 pl-0 sm:pl-2 mb-2 sm:mb-0">
                    <select
                      value={clo.bloomLevel}
                      onChange={(e) => {
                        const level = e.target.value as BloomLevel;
                        const defaultVerb = BLOOM_TAXONOMY_DATA[level]?.categories[0]?.verbs[0] || level;
                        handleUpdateDraftCLO(clo.id, {
                          bloomLevel: level,
                          bloomVerb: defaultVerb,
                        });
                      }}
                      className="w-full px-2 py-1 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="Remember">L1 Remember</option>
                      <option value="Understand">L2 Understand</option>
                      <option value="Apply">L3 Apply</option>
                      <option value="Analyze">L4 Analyze</option>
                      <option value="Evaluate">L5 Evaluate</option>
                      <option value="Create">L6 Create</option>
                    </select>
                  </div>

                  {/* Statement Input */}
                  <div className="flex-1 px-0 sm:px-3 mb-2 sm:mb-0">
                    <textarea
                      rows={2}
                      value={clo.statement}
                      onChange={(e) => handleUpdateDraftCLO(clo.id, { statement: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white resize-none"
                      placeholder="Measurable action statement starting with an observable Bloom verb..."
                    />
                  </div>

                  {/* Weightage Input */}
                  <div className="w-full sm:w-24 text-center px-1 mb-2 sm:mb-0">
                    <div className="flex items-center justify-center space-x-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={clo.weightage ?? 0}
                        onChange={(e) =>
                          handleUpdateDraftCLO(clo.id, { weightage: Number(e.target.value) || 0 })
                        }
                        className="w-16 px-1.5 py-1 text-xs text-center font-bold font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                      />
                      <span className="text-xs text-slate-400 font-bold">%</span>
                    </div>
                  </div>

                  {/* Individual Actions */}
                  <div className="w-full sm:w-28 flex items-center justify-center space-x-1">
                    <button
                      type="button"
                      onClick={() => handleDuplicateSingle(clo.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                      title="Duplicate this CLO"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSingle(clo.id)}
                      disabled={draftCLOs.length <= 1}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Delete this CLO"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-500">Weightage Sum:</span>
              <span
                className={`font-mono font-bold px-2 py-0.5 rounded-md ${
                  totalWeightage === 100
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {totalWeightage}%
              </span>
              {totalWeightage !== 100 && (
                <span className="text-[10px] text-amber-700">
                  (Must equal 100% for full compliance)
                </span>
              )}
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="text-slate-500">Higher-Order (L4–L6):</span>
              <span
                className={`font-mono font-bold px-2 py-0.5 rounded-md ${
                  higherOrderPercentage >= 50
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {higherOrderPercentage}% ({higherOrderCount} of {draftCLOs.length})
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              id="clo-bulk-editor-save-btn"
              onClick={handleSave}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-sm shadow-indigo-300 flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Apply &amp; Save ({draftCLOs.length} Outcomes)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
