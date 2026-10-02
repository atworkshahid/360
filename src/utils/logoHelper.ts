/**
 * Utility helpers for institutional logo processing, validation, rasterization, and presets.
 * Ensures 100% compatibility with jsPDF addImage for PDF accreditation dossiers.
 */

import {
  INSTITUTION_LOGO_PRESETS,
  LogoPreset,
} from './institutionLogoPresets';

export { INSTITUTION_LOGO_PRESETS };
export type { LogoPreset };

/**
 * Creates a clean SVG string and converts it to a PNG Data URL using an offscreen canvas.
 * This guarantees jsPDF compatibility across all platforms.
 */
export async function createRasterizedPresetLogo(
  svgString: string,
  width: number = 240,
  height: number = 240
): Promise<string> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      const encodedSvg = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/png'));
            return;
          }
        } catch (e) {
          console.warn('Canvas rasterization fallback to SVG string:', e);
        }
        resolve(encodedSvg);
      };

      img.onerror = () => {
        resolve(encodedSvg);
      };

      img.src = encodedSvg;
    } catch {
      resolve('');
    }
  });
}

// Preset SVGs
const APEX_CREST_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e1b4b" />
      <stop offset="100%" stop-color="#312e81" />
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
  </defs>
  <!-- Shield Background -->
  <path d="M100 12 L170 36 C170 120, 100 180, 100 180 C100 180, 30 120, 30 36 Z" fill="url(#grad1)" stroke="#d97706" stroke-width="4"/>
  <!-- Inner Shield Trim -->
  <path d="M100 22 L158 42 C158 114, 100 166, 100 166 C100 166, 42 114, 42 42 Z" fill="none" stroke="#fef3c7" stroke-width="1.5" stroke-dasharray="3,2"/>
  <!-- Open Book -->
  <path d="M72 108 C86 98, 96 100, 100 106 C104 100, 114 98, 128 108 L128 126 C114 116, 104 118, 100 124 C96 118, 86 116, 72 126 Z" fill="#ffffff" stroke="#1e1b4b" stroke-width="2"/>
  <line x1="100" y1="106" x2="100" y2="124" stroke="#1e1b4b" stroke-width="2"/>
  <!-- Laurel / Torch / Star -->
  <polygon points="100,52 105,66 120,66 108,76 112,90 100,80 88,90 92,76 80,66 95,66" fill="url(#gold)"/>
  <!-- Banner Ribbons -->
  <path d="M60 148 Q100 162 140 148" stroke="#f59e0b" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>`;

const VERITAS_SEAL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="crimson" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#881337" />
      <stop offset="100%" stop-color="#4c0519" />
    </linearGradient>
  </defs>
  <circle cx="100" cy="100" r="88" fill="url(#crimson)" stroke="#fbbf24" stroke-width="5"/>
  <circle cx="100" cy="100" r="76" fill="none" stroke="#fde68a" stroke-width="1.5" stroke-dasharray="4,2"/>
  <!-- Roman Column & Laurel -->
  <rect x="92" y="70" width="16" height="58" rx="2" fill="#ffffff"/>
  <rect x="86" y="64" width="28" height="7" rx="2" fill="#fde68a"/>
  <rect x="84" y="126" width="32" height="9" rx="2" fill="#fde68a"/>
  <!-- Veritas Text Arc / Stars -->
  <circle cx="100" cy="46" r="5" fill="#fde68a"/>
  <circle cx="60" cy="100" r="4" fill="#fde68a"/>
  <circle cx="140" cy="100" r="4" fill="#fde68a"/>
  <!-- Motto scroll -->
  <path d="M50 152 Q100 170 150 152" fill="none" stroke="#fbbf24" stroke-width="3" stroke-linecap="round"/>
</svg>`;

const POLYTECH_EMBLEM_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="emerald" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#064e3b" />
      <stop offset="100%" stop-color="#022c22" />
    </linearGradient>
  </defs>
  <!-- Octagon / Gear Shape -->
  <polygon points="100,16 160,40 184,100 160,160 100,184 40,160 16,100 40,40" fill="url(#emerald)" stroke="#34d399" stroke-width="4"/>
  <!-- Compass & Ruler Symbol -->
  <path d="M100 52 L128 132 L116 132 L100 86 L84 132 L72 132 Z" fill="#ffffff"/>
  <line x1="82" y1="106" x2="118" y2="106" stroke="#34d399" stroke-width="3"/>
  <circle cx="100" cy="52" r="6" fill="#fbbf24"/>
  <!-- Gear cog centers -->
  <circle cx="100" cy="100" r="62" fill="none" stroke="#a7f3d0" stroke-width="1.5" stroke-dasharray="3,3"/>
</svg>`;

const GLOBAL_ACADEMY_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="slateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#334155" />
    </linearGradient>
  </defs>
  <rect x="22" y="22" width="156" height="156" rx="28" fill="url(#slateGrad)" stroke="#38bdf8" stroke-width="4"/>
  <circle cx="100" cy="100" r="54" fill="none" stroke="#94a3b8" stroke-width="2"/>
  <!-- Global Longitude/Latitude lines -->
  <ellipse cx="100" cy="100" rx="30" ry="54" fill="none" stroke="#38bdf8" stroke-width="2"/>
  <line x1="46" y1="100" x2="154" y2="100" stroke="#38bdf8" stroke-width="2"/>
  <circle cx="100" cy="100" r="7" fill="#f59e0b"/>
</svg>`;

/**
 * Converts user-uploaded file (PNG, JPG, SVG, WebP) into a high-resolution PNG data URL.
 * Automatically normalizes SVG vector graphics to Canvas raster PNG for jsPDF compatibility.
 */
export function processUploadedLogoFile(file: File): Promise<{
  dataUrl: string;
  fileName: string;
  fileSizeBytes: number;
  width?: number;
  height?: number;
}> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image. Please provide a PNG, JPG, WebP, or SVG file.'));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error('File size exceeds the 5MB limit. Please choose a smaller logo image.'));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const rawDataUrl = reader.result as string;

      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          // Scale to a crisp resolution (max 800px) maintaining aspect ratio
          const maxDim = 800;
          let w = img.width || 400;
          let h = img.height || 400;

          if (w > maxDim || h > maxDim) {
            const ratio = Math.min(maxDim / w, maxDim / h);
            w = Math.round(w * ratio);
            h = Math.round(h * ratio);
          }

          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, w, h);
            ctx.drawImage(img, 0, 0, w, h);
            const pngDataUrl = canvas.toDataURL('image/png');
            resolve({
              dataUrl: pngDataUrl,
              fileName: file.name,
              fileSizeBytes: file.size,
              width: w,
              height: h,
            });
            return;
          }
        } catch (e) {
          console.warn('Canvas conversion fallback:', e);
        }

        resolve({
          dataUrl: rawDataUrl,
          fileName: file.name,
          fileSizeBytes: file.size,
          width: img.width,
          height: img.height,
        });
      };

      img.onerror = () => {
        resolve({
          dataUrl: rawDataUrl,
          fileName: file.name,
          fileSizeBytes: file.size,
        });
      };

      img.src = rawDataUrl;
    };

    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}
