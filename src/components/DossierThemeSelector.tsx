import React, { useState } from 'react';
import {
  Palette,
  Sparkles,
  Check,
  RotateCcw,
  Sliders,
  Building,
  GraduationCap,
  Eye,
  Wand2,
  ShieldCheck,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  DOSSIER_THEME_PRESETS,
  FAMOUS_UNIVERSITY_PALETTES,
  DossierThemeOption,
  FamousUniversityPalette,
  hexToRgb,
  calculateContrastRatio,
  getContrastCompliance,
  suggestAccentColor,
} from '../utils/dossierThemePresets';

interface DossierThemeSelectorProps {
  selectedThemeId?: string;
  customPrimaryColor?: string;
  customAccentColor?: string;
  institutionName?: string;
  institutionLogo?: string;
  departmentName?: string;
  showPreviewCard?: boolean;
  onThemeSelect: (themeId: string) => void;
  onCustomColorChange: (primaryHex: string, accentHex?: string) => void;
  className?: string;
}

export const DossierThemeSelector: React.FC<DossierThemeSelectorProps> = ({
  selectedThemeId = 'navy',
  customPrimaryColor = '',
  customAccentColor = '',
  institutionName = 'Apex Institute of Science & Technology',
  institutionLogo = '',
  departmentName = 'Department of Computer Science & Software Engineering',
  showPreviewCard = true,
  onThemeSelect,
  onCustomColorChange,
  className = '',
}) => {
  const [activeMode, setActiveMode] = useState<'presets' | 'famous' | 'custom'>(() => {
    return customPrimaryColor ? 'custom' : 'presets';
  });

  const [primaryInput, setPrimaryInput] = useState<string>(customPrimaryColor || '#0f172a');
  const [accentInput, setAccentInput] = useState<string>(customAccentColor || '#312e81');

  const handleSelectPreset = (preset: DossierThemeOption) => {
    setActiveMode('presets');
    onThemeSelect(preset.id);
    onCustomColorChange('', '');
    setPrimaryInput(preset.primaryHex);
    setAccentInput(preset.accentHex);
  };

  const handlePrimaryHexChange = (hex: string) => {
    setPrimaryInput(hex);
    if (hexToRgb(hex)) {
      onThemeSelect('custom');
      onCustomColorChange(hex, accentInput);
    }
  };

  const handleAccentHexChange = (hex: string) => {
    setAccentInput(hex);
    if (hexToRgb(primaryInput)) {
      onThemeSelect('custom');
      onCustomColorChange(primaryInput, hex);
    }
  };

  const handleApplyFamousPalette = (palette: FamousUniversityPalette) => {
    setActiveMode('famous');
    setPrimaryInput(palette.primaryHex);
    setAccentInput(palette.accentHex);
    onThemeSelect('custom');
    onCustomColorChange(palette.primaryHex, palette.accentHex);
  };

  const handleAutoSuggestAccent = () => {
    const suggested = suggestAccentColor(primaryInput);
    setAccentInput(suggested);
    onThemeSelect('custom');
    onCustomColorChange(primaryInput, suggested);
  };

  // Determine current active preview colors
  const activePreset = DOSSIER_THEME_PRESETS.find((p) => p.id === selectedThemeId);
  const effectivePrimary = customPrimaryColor || activePreset?.primaryHex || '#0f172a';
  const effectiveAccent = customAccentColor || activePreset?.accentHex || '#312e81';

  // Contrast calculation
  const contrastRatio = calculateContrastRatio(effectivePrimary, '#FFFFFF');
  const compliance = getContrastCompliance(contrastRatio);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-2.5 gap-2">
        <div className="flex items-center space-x-2">
          <Palette className="w-4 h-4 text-indigo-600 shrink-0" />
          <div>
            <span className="text-xs font-bold text-slate-800 block">
              Dossier Accreditation Color Themes &amp; Institutional Identity
            </span>
            <span className="text-[10px] text-slate-400">
              Harmonizes executive cover page, running headers, compliance seals, and tables
            </span>
          </div>
        </div>

        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveMode('presets')}
            className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer text-xs ${
              activeMode === 'presets'
                ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Academic Presets
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('famous')}
            className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer text-xs flex items-center gap-1 ${
              activeMode === 'famous'
                ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3 h-3 text-indigo-500" />
            <span>University Palettes</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveMode('custom');
              if (!customPrimaryColor) {
                handlePrimaryHexChange(effectivePrimary);
              }
            }}
            className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer text-xs flex items-center gap-1 ${
              activeMode === 'custom'
                ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3 h-3 text-indigo-500" />
            <span>Custom Hex</span>
          </button>
        </div>
      </div>

      {/* MODE 1: Academic Curated Presets */}
      {activeMode === 'presets' && (
        <div className="space-y-3 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {DOSSIER_THEME_PRESETS.map((preset) => {
              const isSelected = selectedThemeId === preset.id && !customPrimaryColor;

              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between group ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 shadow-xs ring-1 ring-indigo-500'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-1.5">
                        <span
                          className="w-4 h-4 rounded-full border border-black/10 shadow-2xs shrink-0"
                          style={{ backgroundColor: preset.primaryHex }}
                          title={`Primary: ${preset.primaryHex}`}
                        />
                        <span
                          className="w-3 h-3 rounded-full border border-black/10 shadow-2xs shrink-0"
                          style={{ backgroundColor: preset.accentHex }}
                          title={`Accent: ${preset.accentHex}`}
                        />
                      </div>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-900">
                      {preset.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold mb-1">
                      {preset.category}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {preset.description}
                    </p>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400 truncate">
                    Ex: {preset.sampleInstitutions}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* MODE 2: Famous University Identity Palettes */}
      {activeMode === 'famous' && (
        <div className="space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              Institutional Heritage &amp; Landmark University Palettes:
            </span>
            <span className="text-[10px] text-slate-400">
              Official color guides of premier global institutions
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {FAMOUS_UNIVERSITY_PALETTES.map((u) => {
              const isMatch =
                effectivePrimary.toLowerCase() === u.primaryHex.toLowerCase() &&
                effectiveAccent.toLowerCase() === u.accentHex.toLowerCase();

              return (
                <button
                  key={u.name}
                  type="button"
                  onClick={() => handleApplyFamousPalette(u)}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    isMatch
                      ? 'border-indigo-600 bg-indigo-50 shadow-xs ring-1 ring-indigo-500'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-1.5">
                      <span
                        className="w-4 h-4 rounded-full border border-black/10 shrink-0 shadow-2xs"
                        style={{ backgroundColor: u.primaryHex }}
                      />
                      <span
                        className="w-3 h-3 rounded-full border border-black/10 shrink-0 shadow-2xs"
                        style={{ backgroundColor: u.accentHex }}
                      />
                    </div>
                    {isMatch && (
                      <span className="w-3.5 h-3.5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-2 h-2" />
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 leading-tight">
                      {u.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      {u.tagline}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* MODE 3: Custom Institutional Brand Colors */}
      {activeMode === 'custom' && (
        <div className="space-y-4 p-4 rounded-xl border border-slate-200 bg-slate-50/80 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Custom Institutional Brand Palette
              </span>
              <span className="text-[11px] text-slate-500">
                Match your exact official university style guide by specifying primary and secondary hex values.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setPrimaryInput('#0f172a');
                setAccentInput('#312e81');
                onThemeSelect('navy');
                onCustomColorChange('', '');
                setActiveMode('presets');
              }}
              className="text-[11px] text-slate-500 hover:text-indigo-600 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to Default</span>
            </button>
          </div>

          {/* Color Pickers & Hex Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            {/* Primary Color */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Primary Brand Color <span className="text-slate-400">(Headers &amp; Titles)</span>
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={primaryInput.startsWith('#') && primaryInput.length === 7 ? primaryInput : '#0f172a'}
                  onChange={(e) => handlePrimaryHexChange(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white shrink-0 shadow-2xs"
                  title="Click to open system color picker"
                />
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={primaryInput}
                    onChange={(e) => handlePrimaryHexChange(e.target.value)}
                    placeholder="#1E3A8A"
                    maxLength={7}
                    className="w-full pl-3 pr-8 py-2 text-xs font-mono font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase bg-slate-50/50"
                  />
                  <span
                    className="w-3.5 h-3.5 rounded-full absolute right-2.5 top-2.5 border border-black/10 shadow-2xs"
                    style={{ backgroundColor: primaryInput }}
                  />
                </div>
              </div>
              <span className="text-[10px] text-slate-400 block">
                Applied to Cover Page Title, Running Headers, Section Banners, and Main Dividers.
              </span>
            </div>

            {/* Accent Color */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  Secondary Accent Color <span className="text-slate-400">(Badges &amp; Borders)</span>
                </label>
                <button
                  type="button"
                  onClick={handleAutoSuggestAccent}
                  className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                  title="Auto-calculate a harmonious accent color from the primary"
                >
                  <Wand2 className="w-3 h-3" />
                  <span>Auto-Harmonize</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={accentInput.startsWith('#') && accentInput.length === 7 ? accentInput : '#312e81'}
                  onChange={(e) => handleAccentHexChange(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white shrink-0 shadow-2xs"
                  title="Click to open system color picker"
                />
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={accentInput}
                    onChange={(e) => handleAccentHexChange(e.target.value)}
                    placeholder="#312E81"
                    maxLength={7}
                    className="w-full pl-3 pr-8 py-2 text-xs font-mono font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase bg-slate-50/50"
                  />
                  <span
                    className="w-3.5 h-3.5 rounded-full absolute right-2.5 top-2.5 border border-black/10 shadow-2xs"
                    style={{ backgroundColor: accentInput }}
                  />
                </div>
              </div>
              <span className="text-[10px] text-slate-400 block">
                Applied to Accent Pills, Sub-headings, Compliance Badges, and Table Callouts.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Live Contrast & Status Bar */}
      <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <div
              className="w-8 h-8 rounded-lg shadow-xs border border-black/10 flex items-center justify-center font-bold text-white text-[10px]"
              style={{ backgroundColor: effectivePrimary }}
              title="Primary Color"
            >
              Pri
            </div>
            <div
              className="w-8 h-8 rounded-lg shadow-xs border border-black/10 flex items-center justify-center font-bold text-white text-[10px]"
              style={{ backgroundColor: effectiveAccent }}
              title="Accent Color"
            >
              Acc
            </div>
          </div>

          <div>
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <span>Active Palette:</span>
              <span className="font-mono text-indigo-700">{effectivePrimary.toUpperCase()}</span>
              {customPrimaryColor ? (
                <span className="px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-800 text-[9px] font-bold">
                  Custom Brand Hex
                </span>
              ) : (
                <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 text-[9px] font-bold">
                  {activePreset?.name || 'Curated Preset'}
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500">
              Primary: <span className="font-mono">{effectivePrimary}</span> • Accent: <span className="font-mono">{effectiveAccent}</span>
            </div>
          </div>
        </div>

        {/* Accessibility badge */}
        <div className="flex items-center space-x-2">
          <div
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 ${compliance.bgColor} ${compliance.textColor}`}
          >
            {compliance.isAccessible ? (
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>{contrastRatio}:1 Contrast • {compliance.badge}</span>
          </div>
        </div>
      </div>

      {/* Embedded Live In-Situ Dossier Mini Preview */}
      {showPreviewCard && (
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-indigo-600" />
              <span>Simulated PDF Dossier Output Preview</span>
            </span>
            <span className="text-[10px] text-slate-400">
              Instant reflection of selected primary &amp; accent colors
            </span>
          </div>

          {/* Simulated mini cover page card */}
          <div
            className="bg-white rounded-lg p-3.5 border shadow-xs space-y-2.5 transition-colors duration-200"
            style={{ borderColor: effectivePrimary + '40' }}
          >
            {/* Mini running header simulation */}
            <div
              className="flex items-center justify-between text-[9px] pb-1 border-b"
              style={{ borderColor: effectivePrimary + '30' }}
            >
              <div className="flex items-center space-x-1.5 font-bold" style={{ color: effectivePrimary }}>
                {institutionLogo ? (
                  <img src={institutionLogo} alt="Logo" className="w-3.5 h-3.5 object-contain inline-block" />
                ) : (
                  <Building className="w-3 h-3 inline-block" />
                )}
                <span className="truncate max-w-[200px]">{institutionName.toUpperCase()}</span>
              </div>
              <span className="text-slate-400 font-mono">ACCREDITATION DOSSIER</span>
            </div>

            {/* Mini cover header banner */}
            <div className="text-center py-2 space-y-1">
              <div
                className="text-[11px] font-black uppercase tracking-wider transition-colors"
                style={{ color: effectivePrimary }}
              >
                {institutionName}
              </div>
              <div className="text-[9px] text-slate-500 font-semibold uppercase">
                {departmentName}
              </div>

              {/* Accent pill */}
              <div className="pt-1">
                <span
                  className="inline-block px-2 py-0.5 rounded text-[8px] font-bold text-white shadow-2xs transition-colors"
                  style={{ backgroundColor: effectiveAccent }}
                >
                  OFFICIAL ACCREDITATION CURRICULUM DOSSIER
                </span>
              </div>
            </div>

            {/* Mini section divider */}
            <div
              className="h-1 rounded-full transition-colors"
              style={{
                background: `linear-gradient(to right, ${effectivePrimary}, ${effectiveAccent}, transparent)`,
              }}
            />

            {/* Mini section banner */}
            <div
              className="p-2 rounded text-[9px] flex items-center justify-between font-bold"
              style={{
                backgroundColor: effectivePrimary + '10',
                color: effectivePrimary,
              }}
            >
              <span>1.0 EXECUTIVE SUMMARY &amp; PROGRAMME ATTRIBUTES</span>
              <span
                className="px-1.5 py-0.2 rounded text-[8px] text-white"
                style={{ backgroundColor: effectivePrimary }}
              >
                COMPLIANT
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
