/**
 * Accreditation Dossier Theme Palettes & Institutional Branding Helpers.
 * Supports standard presets, famous university palettes, and custom institutional hex codes.
 */

export interface DossierThemeOption {
  id: string;
  name: string;
  category: string;
  primaryHex: string;
  accentHex: string;
  description: string;
  sampleInstitutions: string;
}

export const DOSSIER_THEME_PRESETS: DossierThemeOption[] = [
  {
    id: 'navy',
    name: 'Navy Slate',
    category: 'STEM & Engineering',
    primaryHex: '#0f172a',
    accentHex: '#312e81',
    description: 'Deep navy slate with royal indigo accents. The standard baseline for engineering, computing, and technology.',
    sampleInstitutions: 'MIT, Georgia Tech, Apex Tech, Waterloo',
  },
  {
    id: 'cobalt',
    name: 'Royal Cobalt',
    category: 'Public & State Universities',
    primaryHex: '#1e3a8a',
    accentHex: '#2563eb',
    description: 'Vibrant university blue with bright cobalt highlights. Official for public research institutions.',
    sampleInstitutions: 'UC Berkeley, UCLA, Oxford Blue, Toronto',
  },
  {
    id: 'emerald',
    name: 'Imperial Emerald',
    category: 'Life Sciences & Agriculture',
    primaryHex: '#064e3b',
    accentHex: '#047857',
    description: 'Deep forest green with bright emerald borders. Ideal for agriculture, biology, environmental sciences, and sustainability.',
    sampleInstitutions: 'Dartmouth, Michigan State, Polytech, Wageningen',
  },
  {
    id: 'burgundy',
    name: 'Oxbridge Burgundy',
    category: 'Classical & Jurisprudence',
    primaryHex: '#4c0519',
    accentHex: '#9f1239',
    description: 'Prestigious crimson-wine with rose accents. Recommended for law, humanities, and classical colleges.',
    sampleInstitutions: 'Harvard, Stanford, Oxford, Chicago',
  },
  {
    id: 'crimson',
    name: 'Cardinal Crimson',
    category: 'Medicine & Health Sciences',
    primaryHex: '#881337',
    accentHex: '#be123c',
    description: 'Bold red with carmine accents. Standard for medical faculties, pharmacy, and nursing colleges.',
    sampleInstitutions: 'Johns Hopkins, McGill, Indiana, McMaster',
  },
  {
    id: 'amber',
    name: 'Warm Ochre & Bronze',
    category: 'Architecture & Earth Sciences',
    primaryHex: '#78350f',
    accentHex: '#b45309',
    description: 'Rich bronze amber with warm gold trim. Ideal for architecture, civil design, and geology.',
    sampleInstitutions: 'Purdue, Princeton Gold, Colorado Mines',
  },
  {
    id: 'violet',
    name: 'Regal Amethyst',
    category: 'Interdisciplinary & Research',
    primaryHex: '#4c1d95',
    accentHex: '#6d28d9',
    description: 'Royal purple with vibrant violet highlights. Recommended for graduate schools and pure sciences.',
    sampleInstitutions: 'NYU, Northwestern, Washington, Manchester',
  },
  {
    id: 'slate',
    name: 'Executive Slate',
    category: 'Modern & Polytechnic',
    primaryHex: '#1e293b',
    accentHex: '#334155',
    description: 'High-contrast monochrome slate. Clean, minimalist executive dossier styling.',
    sampleInstitutions: 'Federal Institutes, Modern Academies, ETH',
  },
];

export interface FamousUniversityPalette {
  name: string;
  country: string;
  primaryHex: string;
  accentHex: string;
  tagline: string;
}

export const FAMOUS_UNIVERSITY_PALETTES: FamousUniversityPalette[] = [
  { name: 'Harvard Crimson', country: 'USA', primaryHex: '#A51C30', accentHex: '#1E1E1E', tagline: 'Veritas Crimson' },
  { name: 'Oxford Deep Blue', country: 'UK', primaryHex: '#002147', accentHex: '#1D70B8', tagline: 'Dominus Illuminatio' },
  { name: 'Cambridge Cyan', country: 'UK', primaryHex: '#0072CE', accentHex: '#A3C1AD', tagline: 'Hinc Lucem Blue' },
  { name: 'Stanford Cardinal', country: 'USA', primaryHex: '#8C1515', accentHex: '#D97706', tagline: 'Cardinal & Palo Alto Gold' },
  { name: 'MIT Cardinal & Gray', country: 'USA', primaryHex: '#A31F34', accentHex: '#8A8B8C', tagline: 'Mens et Manus' },
  { name: 'UC Berkeley Navy', country: 'USA', primaryHex: '#003262', accentHex: '#FDB515', tagline: 'California Gold & Blue' },
  { name: 'Princeton Orange', country: 'USA', primaryHex: '#E77500', accentHex: '#121212', tagline: 'Nassau Orange & Black' },
  { name: 'Imperial Blue & Gold', country: 'UK', primaryHex: '#003E74', accentHex: '#DDA600', tagline: 'Imperial STEM Blue' },
  { name: 'Edinburgh Scottish Navy', country: 'UK', primaryHex: '#041E42', accentHex: '#D50032', tagline: 'Edinburgh Ensign Navy' },
  { name: 'Toronto True Blue', country: 'Canada', primaryHex: '#002A5C', accentHex: '#7BA4D5', tagline: 'Boundless Blue' },
  { name: 'Melbourne Navy', country: 'Australia', primaryHex: '#094183', accentHex: '#F5A623', tagline: 'Postera Crescam' },
  { name: 'ETH Zurich Heritage', country: 'Switzerland', primaryHex: '#1F407A', accentHex: '#D32F2F', tagline: 'Polytechnic Blue & Red' },
];

export function hexToRgb(hex: string): [number, number, number] | null {
  if (!hex) return null;
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : [r, g, b];
  }
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : [r, g, b];
  }
  return null;
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)));
  return (
    '#' +
    [r, g, b]
      .map((x) => clamp(x).toString(16).padStart(2, '0'))
      .join('')
  );
}

/**
 * Calculates WCAG 2.1 relative luminance.
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
  const srgb = [r, g, b].map((val) => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

/**
 * Calculates contrast ratio between two hex colors (defaulting to white paper background).
 */
export function calculateContrastRatio(foregroundHex: string, backgroundHex: string = '#FFFFFF'): number {
  const fg = hexToRgb(foregroundHex) || [15, 23, 42];
  const bg = hexToRgb(backgroundHex) || [255, 255, 255];
  const l1 = getRelativeLuminance(fg[0], fg[1], fg[2]);
  const l2 = getRelativeLuminance(bg[0], bg[1], bg[2]);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(1));
}

export function getContrastCompliance(ratio: number): {
  badge: string;
  isAccessible: boolean;
  textColor: string;
  bgColor: string;
  description: string;
} {
  if (ratio >= 7.0) {
    return {
      badge: 'WCAG AAA (Enhanced)',
      isAccessible: true,
      textColor: 'text-emerald-800',
      bgColor: 'bg-emerald-50 border-emerald-200',
      description: 'Superb print contrast; sharp and legible on high-resolution paper.',
    };
  }
  if (ratio >= 4.5) {
    return {
      badge: 'WCAG AA (Standard)',
      isAccessible: true,
      textColor: 'text-blue-800',
      bgColor: 'bg-blue-50 border-blue-200',
      description: 'Meets official institutional accreditation legibility guidelines.',
    };
  }
  return {
    badge: 'Low Contrast Warning',
    isAccessible: false,
    textColor: 'text-amber-800',
    bgColor: 'bg-amber-50 border-amber-200',
    description: 'Light color on white paper may reduce readability in print.',
  };
}

/**
 * Suggests a harmonious accent color given a primary color hex.
 */
export function suggestAccentColor(primaryHex: string): string {
  const rgb = hexToRgb(primaryHex);
  if (!rgb) return '#312e81';
  // If dark color, suggest a brighter vibrant version
  const [r, g, b] = rgb;
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  if (brightness < 80) {
    // Lighten and add saturation
    return rgbToHex(
      Math.min(255, Math.round(r * 1.8 + 30)),
      Math.min(255, Math.round(g * 1.8 + 40)),
      Math.min(255, Math.round(b * 1.8 + 60))
    );
  }
  // Otherwise complement
  return rgbToHex(
    Math.max(0, Math.round(r * 0.6)),
    Math.max(0, Math.round(g * 0.7)),
    Math.min(255, Math.round(b * 1.3))
  );
}

export interface DynamicThemePalette {
  primary: [number, number, number];
  accent: [number, number, number];
  secondary: [number, number, number];
  lightBg: [number, number, number];
  cardBg: [number, number, number];
  border: [number, number, number];
  success: [number, number, number];
  warning: [number, number, number];
  danger: [number, number, number];
}

/**
 * Builds a harmonious, accessible PDF palette from any custom primary/accent hex color.
 */
export function buildDynamicThemePalette(
  primaryHex: string,
  accentHex?: string
): DynamicThemePalette {
  const primaryRgb = hexToRgb(primaryHex) || [15, 23, 42];
  const accentRgb = accentHex ? (hexToRgb(accentHex) || primaryRgb) : primaryRgb;

  // Tinted soft background (96% white + 4% primary)
  const lightBg: [number, number, number] = [
    Math.round(255 * 0.96 + primaryRgb[0] * 0.04),
    Math.round(255 * 0.96 + primaryRgb[1] * 0.04),
    Math.round(255 * 0.96 + primaryRgb[2] * 0.04),
  ];

  // Card background (92% white + 8% primary)
  const cardBg: [number, number, number] = [
    Math.round(255 * 0.92 + primaryRgb[0] * 0.08),
    Math.round(255 * 0.92 + primaryRgb[1] * 0.08),
    Math.round(255 * 0.92 + primaryRgb[2] * 0.08),
  ];

  // Border (82% white + 18% primary)
  const border: [number, number, number] = [
    Math.round(255 * 0.82 + primaryRgb[0] * 0.18),
    Math.round(255 * 0.82 + primaryRgb[1] * 0.18),
    Math.round(255 * 0.82 + primaryRgb[2] * 0.18),
  ];

  return {
    primary: primaryRgb,
    accent: accentRgb,
    secondary: [71, 85, 105],
    lightBg,
    cardBg,
    border,
    success: [16, 185, 129],
    warning: [217, 119, 6],
    danger: [225, 29, 72],
  };
}
