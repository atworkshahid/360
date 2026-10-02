import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  Building2,
} from 'lucide-react';
import {
  INSTITUTION_LOGO_PRESETS,
  processUploadedLogoFile,
  LogoPreset,
} from '../utils/logoHelper';

interface InstitutionalLogoUploaderProps {
  currentLogoUrl?: string;
  institutionName?: string;
  onLogoChange: (logoDataUrl: string) => void;
  onClearLogo: () => void;
  className?: string;
  showPresets?: boolean;
}

export const InstitutionalLogoUploader: React.FC<InstitutionalLogoUploaderProps> = ({
  currentLogoUrl,
  institutionName = 'Apex Institute of Science & Technology',
  onLogoChange,
  onClearLogo,
  className = '',
  showPresets = true,
}) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [previewBg, setPreviewBg] = useState<'white' | 'checker' | 'slate'>('white');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessNotice(null);

    try {
      const result = await processUploadedLogoFile(file);
      onLogoChange(result.dataUrl);
      setSuccessNotice(`Logo "${file.name}" uploaded successfully!`);
      setTimeout(() => setSuccessNotice(null), 3000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to process image file. Please try a different PNG or JPG.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSelectPreset = (preset: LogoPreset) => {
    setErrorMessage(null);
    onLogoChange(preset.dataUrl);
    setSuccessNotice(`Applied "${preset.name}" preset emblem.`);
    setTimeout(() => setSuccessNotice(null), 3000);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
          }
        }}
        accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
        className="hidden"
      />

      {/* Main Upload / Preview Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Upload Dropzone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`md:col-span-7 border-2 border-dashed rounded-2xl p-5 text-center transition cursor-pointer flex flex-col items-center justify-center min-h-[160px] ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/80 scale-[1.01]'
              : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50/80 bg-white'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-3 shadow-2xs">
            {isProcessing ? (
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
            ) : (
              <Upload className="w-6 h-6 text-indigo-600" />
            )}
          </div>

          <div className="text-xs font-bold text-slate-900 mb-1">
            {isProcessing ? 'Processing image...' : 'Click to upload or drag & drop logo'}
          </div>
          <p className="text-[11px] text-slate-500 max-w-xs mb-2">
            PNG, JPG, SVG, or WebP. Optimal size: square or crest format (up to 5MB).
          </p>

          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold">
            <Sparkles className="w-3 h-3 text-indigo-600" />
            <span>Printed on Cover Page &amp; Headers of Accreditation Dossier PDF</span>
          </span>
        </div>

        {/* Live Logo Display & Controls */}
        <div className="md:col-span-5 bg-slate-50 rounded-2xl border border-slate-200 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Dossier Logo Output</span>
            </span>

            {/* Background Checker Toggle */}
            <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 text-[10px]">
              <button
                type="button"
                onClick={() => setPreviewBg('white')}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${
                  previewBg === 'white' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="White paper background"
              >
                White
              </button>
              <button
                type="button"
                onClick={() => setPreviewBg('checker')}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${
                  previewBg === 'checker' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Transparent grid background"
              >
                Grid
              </button>
              <button
                type="button"
                onClick={() => setPreviewBg('slate')}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${
                  previewBg === 'slate' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Dark slate background"
              >
                Dark
              </button>
            </div>
          </div>

          {/* Logo Frame */}
          <div className="my-3 flex items-center justify-center">
            {currentLogoUrl ? (
              <div
                className={`w-28 h-28 rounded-xl border border-slate-300 p-2 flex items-center justify-center overflow-hidden shadow-xs transition ${
                  previewBg === 'white'
                    ? 'bg-white'
                    : previewBg === 'checker'
                    ? 'bg-[linear-gradient(45deg,#f1f5f9_25%,transparent_25%),linear-gradient(-45deg,#f1f5f9_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f1f5f9_75%),linear-gradient(-45deg,transparent_75%,#f1f5f9_75%)] bg-[size:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0px]'
                    : 'bg-slate-900'
                }`}
              >
                <img
                  src={currentLogoUrl}
                  alt={`${institutionName} Logo`}
                  className="max-w-full max-h-full object-contain drop-shadow-2xs"
                />
              </div>
            ) : (
              <div className="w-28 h-28 rounded-xl border border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                <ImageIcon className="w-8 h-8 text-slate-300 mb-1" />
                <span className="text-[10px] text-slate-400 font-semibold">No logo set</span>
                <span className="text-[9px] text-slate-400">(Default text header will be printed)</span>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200">
            {currentLogoUrl ? (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <RefreshCw className="w-3 h-3 text-slate-600" />
                  <span>Replace</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClearLogo();
                    setSuccessNotice('Institutional logo removed.');
                    setTimeout(() => setSuccessNotice(null), 2500);
                  }}
                  className="px-2.5 py-1 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-semibold transition cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3 text-rose-600" />
                  <span>Remove</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-1.5 rounded-lg border border-indigo-200 bg-white hover:bg-indigo-50 text-indigo-700 text-[11px] font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5 text-indigo-600" />
                <span>Choose Image File</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Status Notifications */}
      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center space-x-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Preset Academic Emblems */}
      {showPresets && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              Or Choose an Institutional Preset Emblem:
            </span>
            <span className="text-[10px] text-slate-400">1-click test drive</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {INSTITUTION_LOGO_PRESETS.map((preset) => {
              const isSelected = currentLogoUrl === preset.dataUrl;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center space-x-2.5 group ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 shadow-xs ring-1 ring-indigo-500'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg border border-slate-200 p-1 bg-white shrink-0 flex items-center justify-center shadow-2xs">
                    <img
                      src={preset.dataUrl}
                      alt={preset.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-slate-900 truncate">
                      {preset.name}
                    </div>
                    <div className="text-[9px] text-slate-500 truncate">
                      {preset.subtitle.split('with')[0]}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
