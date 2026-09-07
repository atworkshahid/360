import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Upload,
  FileText,
  Download,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Plus,
  RefreshCw,
  Layers,
  ArrowRight,
  HelpCircle,
  FileSpreadsheet,
  Check,
  Wand2,
} from 'lucide-react';
import { BloomLevel, CLO, LearningDomain, PLO } from '../../types';
import {
  parseCLOImportText,
  convertParsedRowsToCLOs,
  downloadSampleCSVFile,
  generateSampleCSVContent,
  generateSampleListContent,
  calculateEvenWeights,
  ParsedCLORow,
  ParseResult,
} from '../../services/cloImportService';
import { BLOOM_TAXONOMY_DATA } from './BloomsTaxonomyHelperModal';

interface BulkImportCLOsModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingCLOs: CLO[];
  availablePLOs?: PLO[];
  onImportCLOs: (importedCLOs: CLO[], mode: 'replace' | 'append') => void;
}

export const BulkImportCLOsModal: React.FC<BulkImportCLOsModalProps> = ({
  isOpen,
  onClose,
  existingCLOs,
  availablePLOs = [],
  onImportCLOs,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('paste');
  const [inputText, setInputText] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [importMode, setImportMode] = useState<'replace' | 'append'>(
    existingCLOs.length <= 1 ? 'replace' : 'append'
  );
  const [parsedRows, setParsedRows] = useState<ParsedCLORow[]>([]);
  const [detectedFormat, setDetectedFormat] = useState<string>('text');
  const [parseWarnings, setParseWarnings] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // When modal opens or input changes, parse the content
  const handleParse = (textToParse: string) => {
    if (!textToParse.trim()) {
      setParsedRows([]);
      setParseWarnings([]);
      return;
    }

    const startingNum = importMode === 'append' ? existingCLOs.length + 1 : 1;
    const result: ParseResult = parseCLOImportText(textToParse, startingNum);
    setParsedRows(result.rows);
    setDetectedFormat(result.detectedFormat.toUpperCase());
    setParseWarnings(result.warnings);
  };

  useEffect(() => {
    if (isOpen && inputText.trim()) {
      handleParse(inputText);
    }
  }, [isOpen, importMode]);

  // Handle direct text changes
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputText(val);
    handleParse(val);
  };

  // Handle file reading
  const processFile = (file: File) => {
    if (!file) return;
    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) || '';
      setInputText(text);
      handleParse(text);
    };
    reader.readAsText(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Sample Loaders
  const handleLoadSampleCSV = () => {
    const sample = generateSampleCSVContent();
    setInputText(sample);
    setUploadedFileName('sample_clos.csv');
    handleParse(sample);
    setActiveTab('paste');
  };

  const handleLoadSampleList = () => {
    const sample = generateSampleListContent();
    setInputText(sample);
    setUploadedFileName('sample_list.txt');
    handleParse(sample);
    setActiveTab('paste');
  };

  // Row Manipulation
  const handleToggleRow = (id: string) => {
    setParsedRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r))
    );
  };

  const handleSelectAll = (select: boolean) => {
    setParsedRows((prev) => prev.map((r) => ({ ...r, selected: select })));
  };

  const handleUpdateRow = (id: string, updates: Partial<ParsedCLORow>) => {
    setParsedRows((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const updated = { ...r, ...updates };
          return updated;
        }
        return r;
      })
    );
  };

  const handleDeleteRow = (id: string) => {
    setParsedRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSubstituteVerb = (rowId: string, substituteVerb: string) => {
    const row = parsedRows.find((r) => r.id === rowId);
    if (!row) return;

    let matchedLevel: BloomLevel = row.bloomLevel;
    (Object.keys(BLOOM_TAXONOMY_DATA) as BloomLevel[]).forEach((lvl) => {
      if (BLOOM_TAXONOMY_DATA[lvl].categories.some((c) => c.verbs.includes(substituteVerb))) {
        matchedLevel = lvl;
      }
    });

    // Replace first word in statement
    const words = row.statement.trim().split(/\s+/);
    words[0] = substituteVerb;
    const newStatement = words.join(' ');

    handleUpdateRow(rowId, {
      statement: newStatement,
      bloomVerb: substituteVerb,
      bloomLevel: matchedLevel,
      isVagueVerb: false,
      warnings: row.warnings.filter((w) => !w.includes('non-measurable') && !w.includes('vague')),
    });
  };

  // Re-balance weights evenly among selected items
  const handleAutoBalanceWeights = () => {
    const selected = parsedRows.filter((r) => r.selected);
    if (selected.length === 0) return;
    const weights = calculateEvenWeights(selected.length);
    let sIdx = 0;
    setParsedRows((prev) =>
      prev.map((r) => {
        if (r.selected) {
          const w = weights[sIdx++];
          return { ...r, weightage: w };
        }
        return r;
      })
    );
  };

  // Computed metrics
  const selectedRows = useMemo(() => parsedRows.filter((r) => r.selected), [parsedRows]);
  const totalWeight = useMemo(
    () => selectedRows.reduce((sum, r) => sum + (Number(r.weightage) || 0), 0),
    [selectedRows]
  );
  const lotsCount = useMemo(
    () => selectedRows.filter((r) => r.bloomLevel === 'Remember' || r.bloomLevel === 'Understand').length,
    [selectedRows]
  );
  const hotsCount = useMemo(
    () => selectedRows.filter((r) => ['Apply', 'Analyze', 'Evaluate', 'Create'].includes(r.bloomLevel)).length,
    [selectedRows]
  );

  // Submit and Import
  const handleConfirmImport = () => {
    if (selectedRows.length === 0) return;

    const newCLOs = convertParsedRowsToCLOs(selectedRows, availablePLOs);
    onImportCLOs(newCLOs, importMode);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl my-auto flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Bulk Import Course Learning Outcomes (CLOs)</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  Fast Course Setup
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Import multiple CLOs directly from CSV, Excel/TSV, or plain syllabus text with automatic Bloom's level detection.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Top Quick Actions Bar & Format Help */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100">
            <div className="flex items-center space-x-2 text-xs text-indigo-900 font-medium">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                Supports standard CSV tables, copy-pasted Excel/Sheets columns, or plain numbered lists.
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={downloadSampleCSVFile}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs font-semibold shadow-2xs transition cursor-pointer"
                title="Download formatted CSV spreadsheet template"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                <span>Download Sample CSV</span>
              </button>
              <button
                type="button"
                onClick={handleLoadSampleCSV}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 text-xs font-semibold shadow-2xs transition cursor-pointer"
                title="Load 4 sample accredited outcomes to preview"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Load Sample CSV</span>
              </button>
              <button
                type="button"
                onClick={handleLoadSampleList}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition cursor-pointer"
                title="Load sample numbered text list"
              >
                <FileText className="w-3.5 h-3.5 text-slate-600" />
                <span>Load Sample Text</span>
              </button>
            </div>
          </div>

          {/* Input Method Selector Tabs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200">
              <div className="flex space-x-6">
                <button
                  type="button"
                  onClick={() => setActiveTab('paste')}
                  className={`pb-2.5 text-xs font-bold border-b-2 transition flex items-center space-x-2 cursor-pointer ${
                    activeTab === 'paste'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Paste Text or Spreadsheet Data</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className={`pb-2.5 text-xs font-bold border-b-2 transition flex items-center space-x-2 cursor-pointer ${
                    activeTab === 'upload'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload File (.csv, .txt, .tsv)</span>
                </button>
              </div>

              {parsedRows.length > 0 && (
                <div className="pb-2 flex items-center space-x-2 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">Detected Format:</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[11px] font-bold text-slate-800 border border-slate-200">
                    {detectedFormat}
                  </span>
                  <span>•</span>
                  <span>{parsedRows.length} item(s) found</span>
                </div>
              )}
            </div>

            {/* Tab: Upload File */}
            {activeTab === 'upload' && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-3 ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-50/50'
                    : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt,.tsv,.json"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {uploadedFileName ? (
                      <span className="text-indigo-600">Loaded: {uploadedFileName}</span>
                    ) : (
                      'Drag & drop your CSV or text file here, or click to browse'
                    )}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Accepts standard CSV with headers (Code, Statement, BloomLevel, Weightage) or plain text line lists.
                  </p>
                </div>
              </div>
            )}

            {/* Tab: Paste Text */}
            {activeTab === 'paste' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Enter one CLO per line or paste CSV rows below:</span>
                  {inputText.trim() && (
                    <button
                      type="button"
                      onClick={() => {
                        setInputText('');
                        setParsedRows([]);
                        setUploadedFileName(null);
                      }}
                      className="text-slate-400 hover:text-rose-600 transition"
                    >
                      Clear text
                    </button>
                  )}
                </div>
                <textarea
                  value={inputText}
                  onChange={handleTextChange}
                  rows={6}
                  placeholder={`Example CSV:\nCode,Statement,BloomLevel,Weightage\nCLO 1,"Formulate and implement normalized database schemas.",Analyze,25\nCLO 2,"Analyze computational complexity of recursive algorithms.",Analyze,25\n\nOr Plain Text List:\n1. Formulate normalized database schemas [Analyze]\n2. Analyze computational complexity of algorithms [Analyze]`}
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-xs font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white placeholder:text-slate-400 leading-relaxed resize-y"
                />
              </div>
            )}
          </div>

          {/* Parsed Results Live Verification Table */}
          {parsedRows.length > 0 ? (
            <div className="space-y-4 pt-2">
              {/* Table Toolbar & Stats */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="select-all-clos"
                      checked={selectedRows.length === parsedRows.length && parsedRows.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="select-all-clos" className="text-xs font-bold text-slate-800 cursor-pointer">
                      Select All ({selectedRows.length}/{parsedRows.length})
                    </label>
                  </div>

                  {/* Weightage Badge & Auto-Balance Button */}
                  <div
                    className={`px-2.5 py-1 rounded-md text-xs font-bold border flex items-center space-x-1.5 ${
                      totalWeight === 100
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    <span>Total Weight: {totalWeight}%</span>
                    {totalWeight !== 100 && (
                      <span className="text-[10px] font-normal">
                        ({100 - totalWeight > 0 ? `+${100 - totalWeight}% needed` : `over by ${totalWeight - 100}%`})
                      </span>
                    )}
                  </div>

                  {totalWeight !== 100 && selectedRows.length > 0 && (
                    <button
                      type="button"
                      onClick={handleAutoBalanceWeights}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 transition cursor-pointer"
                      title="Evenly balance weightage to 100% across all selected CLOs"
                    >
                      <RefreshCw className="w-3 h-3 text-indigo-600" />
                      <span>Auto-Balance to 100%</span>
                    </button>
                  )}
                </div>

                {/* Cognitive Distribution Badges */}
                <div className="flex items-center space-x-2 text-xs">
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                    LOTS: <strong className="text-slate-900">{lotsCount}</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium">
                    HOTS: <strong className="text-indigo-900">{hotsCount}</strong>
                  </span>
                </div>
              </div>

              {/* Editable Preview Rows */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs max-h-96 overflow-y-auto">
                <div className="divide-y divide-slate-100">
                  {parsedRows.map((row, index) => (
                    <div
                      key={row.id}
                      className={`p-3.5 transition flex flex-col sm:flex-row sm:items-start gap-3 ${
                        row.selected ? 'bg-white' : 'bg-slate-50/70 opacity-60'
                      }`}
                    >
                      {/* Checkbox & Code */}
                      <div className="flex items-center space-x-2 shrink-0 pt-1">
                        <input
                          type="checkbox"
                          checked={row.selected}
                          onChange={() => handleToggleRow(row.id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={row.code}
                          onChange={(e) => handleUpdateRow(row.id, { code: e.target.value })}
                          className="w-20 px-2 py-1 text-xs font-bold rounded-lg border border-slate-300 bg-slate-50 focus:bg-white"
                          title="CLO Identifier"
                        />
                      </div>

                      {/* Statement & Feedback */}
                      <div className="flex-1 space-y-1.5 min-w-0">
                        <textarea
                          value={row.statement}
                          onChange={(e) => {
                            const newStmt = e.target.value;
                            handleUpdateRow(row.id, {
                              statement: newStmt,
                              isValid: newStmt.trim().length > 10,
                            });
                          }}
                          rows={2}
                          className="w-full px-2.5 py-1.5 text-xs text-slate-800 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white leading-relaxed resize-y"
                          placeholder="Outcome statement..."
                        />

                        {/* Vague Verb Warning & Substitutes */}
                        {row.isVagueVerb && row.suggestedVerbs && (
                          <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex flex-wrap items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span className="font-semibold text-[11px]">
                              Vague verb "{row.bloomVerb}". Click substitute:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {row.suggestedVerbs.map((sub) => (
                                <button
                                  key={sub}
                                  type="button"
                                  onClick={() => handleSubstituteVerb(row.id, sub)}
                                  className="px-2 py-0.5 rounded bg-white hover:bg-amber-100 border border-amber-300 text-amber-800 font-bold text-[10px] transition cursor-pointer shadow-2xs"
                                >
                                  +{sub}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Bloom Level, Weight & Delete */}
                      <div className="flex items-center space-x-2 shrink-0 sm:self-start pt-1">
                        {/* Bloom Level Select */}
                        <select
                          value={row.bloomLevel}
                          onChange={(e) =>
                            handleUpdateRow(row.id, {
                              bloomLevel: e.target.value as BloomLevel,
                            })
                          }
                          className={`text-xs font-bold px-2 py-1 rounded-lg border cursor-pointer ${
                            row.bloomLevel === 'Remember' || row.bloomLevel === 'Understand'
                              ? 'bg-slate-100 text-slate-800 border-slate-300'
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          }`}
                        >
                          <option value="Remember">Remember (C1)</option>
                          <option value="Understand">Understand (C2)</option>
                          <option value="Apply">Apply (C3)</option>
                          <option value="Analyze">Analyze (C4)</option>
                          <option value="Evaluate">Evaluate (C5)</option>
                          <option value="Create">Create (C6)</option>
                        </select>

                        {/* Weightage % Input */}
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={row.weightage}
                            onChange={(e) =>
                              handleUpdateRow(row.id, {
                                weightage: Math.max(0, parseInt(e.target.value) || 0),
                              })
                            }
                            className="w-14 px-2 py-1 text-xs font-bold text-center rounded-lg border border-slate-300 bg-white"
                            title="Weightage percentage"
                          />
                          <span className="text-xs font-bold text-slate-500">%</span>
                        </div>

                        {/* Delete Row Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(row.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition cursor-pointer"
                          title="Remove outcome from import list"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            inputText.trim() && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  No valid CLO rows could be extracted. Please check format or try clicking "Load Sample CSV".
                </span>
              </div>
            )
          )}

          {/* Import Mode: Replace vs Append */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
            <div className="text-xs font-bold text-slate-900">Import Destination Option:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-3 rounded-xl border cursor-pointer transition flex items-start space-x-3 ${
                  importMode === 'replace'
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-2xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="import-mode"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="mt-0.5 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Replace Existing Outcomes ({existingCLOs.length})
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Recommended for initial course setup. Replaces initial draft outcomes with the imported set.
                  </p>
                </div>
              </label>

              <label
                className={`p-3 rounded-xl border cursor-pointer transition flex items-start space-x-3 ${
                  importMode === 'append'
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-2xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="import-mode"
                  checked={importMode === 'append'}
                  onChange={() => setImportMode('append')}
                  className="mt-0.5 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Append to Existing Outcomes (+{existingCLOs.length})
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Keeps current {existingCLOs.length} CLOs intact and appends imported outcomes sequentially.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-xs text-slate-500">
            {selectedRows.length > 0 ? (
              <span>
                Ready to import <strong className="text-slate-900">{selectedRows.length} outcome(s)</strong> into this course.
              </span>
            ) : (
              <span>Paste data or upload a file to preview outcomes.</span>
            )}
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={selectedRows.length === 0}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-100 transition cursor-pointer flex items-center space-x-2"
            >
              <Check className="w-4 h-4" />
              <span>
                Import {selectedRows.length} CLO{selectedRows.length !== 1 ? 's' : ''} ({importMode === 'replace' ? 'Replace' : 'Append'})
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
