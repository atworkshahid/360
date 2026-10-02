import { ResourceItem, ResourcePreviewType } from '../types';

/**
 * Detect the preview category from file name, mime type, or resource type
 */
export function detectPreviewType(
  type: 'file' | 'link',
  fileName?: string,
  fileType?: string,
  url?: string
): ResourcePreviewType {
  if (type === 'link') return 'link';

  const name = (fileName || '').toLowerCase();
  const mime = (fileType || '').toLowerCase();

  // Images
  if (
    mime.startsWith('image/') ||
    /\.(png|jpe?g|webp|svg|gif|bmp|ico|tiff?)$/i.test(name)
  ) {
    return 'image';
  }

  // PDF
  if (mime.includes('pdf') || name.endsWith('.pdf')) {
    return 'pdf';
  }

  // Word / Docs
  if (
    mime.includes('word') ||
    mime.includes('officedocument.wordprocessingml') ||
    /\.(docx?|rtf|odt)$/i.test(name)
  ) {
    return 'doc';
  }

  // Spreadsheets
  if (
    mime.includes('spreadsheet') ||
    mime.includes('excel') ||
    mime.includes('csv') ||
    /\.(xlsx?|csv|tsv|ods)$/i.test(name)
  ) {
    return 'sheet';
  }

  // Slides / Presentations
  if (
    mime.includes('presentation') ||
    mime.includes('powerpoint') ||
    /\.(pptx?|key|odp)$/i.test(name)
  ) {
    return 'slides';
  }

  // Code & markup
  if (
    /\.(tsx?|jsx?|html?|css|scss|json|py|java|c|cpp|cs|php|sql|sh|ya?ml|xml|rb|go|rs|swift)$/i.test(
      name
    )
  ) {
    return 'code';
  }

  // Text & Markdown
  if (
    mime.startsWith('text/') ||
    /\.(txt|md|markdown|log|rst)$/i.test(name)
  ) {
    return 'text';
  }

  // Archives
  if (
    mime.includes('zip') ||
    mime.includes('tar') ||
    /\.(zip|rar|7z|tar|gz|bz2)$/i.test(name)
  ) {
    return 'archive';
  }

  // Audio
  if (mime.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(name)) {
    return 'audio';
  }

  // Video
  if (mime.startsWith('video/') || /\.(mp4|webm|mov|mkv|avi)$/i.test(name)) {
    return 'video';
  }

  return 'generic';
}

/**
 * Generate a visual canvas thumbnail for a document based on its type and title
 */
export function generateDocumentCanvasThumbnail(
  title: string,
  previewType: ResourcePreviewType,
  fileName?: string
): string {
  if (typeof document === 'undefined') return '';

  const canvas = document.createElement('canvas');
  const width = 480;
  const height = 270;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Theme colors per type
  const themeMap: Record<
    ResourcePreviewType,
    { bg: string; header: string; accent: string; badge: string; badgeBg: string }
  > = {
    pdf: { bg: '#fbfcfe', header: '#e11d48', accent: '#fb7185', badge: 'PDF DOCUMENT', badgeBg: '#ffe4e6' },
    doc: { bg: '#f8fafc', header: '#2563eb', accent: '#60a5fa', badge: 'WORD DOCX', badgeBg: '#dbeafe' },
    sheet: { bg: '#f0fdf4', header: '#16a34a', accent: '#4ade80', badge: 'EXCEL SPREADSHEET', badgeBg: '#dcfce7' },
    slides: { bg: '#fffbeb', header: '#ea580c', accent: '#fb923c', badge: 'SLIDES PPTX', badgeBg: '#ffedd5' },
    code: { bg: '#0f172a', header: '#6366f1', accent: '#a5b4fc', badge: 'SOURCE CODE', badgeBg: '#312e81' },
    text: { bg: '#f8fafc', header: '#475569', accent: '#94a3b8', badge: 'TEXT NOTE', badgeBg: '#e2e8f0' },
    image: { bg: '#faf5ff', header: '#9333ea', accent: '#c084fc', badge: 'IMAGE ASSET', badgeBg: '#f3e8ff' },
    archive: { bg: '#fefce8', header: '#ca8a04', accent: '#fde047', badge: 'ARCHIVE PACKAGE', badgeBg: '#fef9c3' },
    audio: { bg: '#fdf2f8', header: '#db2777', accent: '#f472b6', badge: 'AUDIO RECORDING', badgeBg: '#fce7f3' },
    video: { bg: '#f5f3ff', header: '#7c3aed', accent: '#a78bfa', badge: 'VIDEO MEDIA', badgeBg: '#ede9fe' },
    link: { bg: '#f0f9ff', header: '#0284c7', accent: '#38bdf8', badge: 'EXTERNAL LINK', badgeBg: '#e0f2fe' },
    generic: { bg: '#f8fafc', header: '#64748b', accent: '#cbd5e1', badge: 'FILE ASSET', badgeBg: '#f1f5f9' },
  };

  const theme = themeMap[previewType] || themeMap.generic;

  // Background
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, width, height);

  // Top header bar
  ctx.fillStyle = theme.header;
  ctx.fillRect(0, 0, width, 12);

  // Subtle paper shadow / document page frame in center
  const pageX = 36;
  const pageY = 28;
  const pageWidth = width - 72;
  const pageHeight = height - 48;

  ctx.fillStyle = previewType === 'code' ? '#1e293b' : '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,0.08)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(pageX, pageY, pageWidth, pageHeight, 8) : ctx.rect(pageX, pageY, pageWidth, pageHeight);
  ctx.fill();

  ctx.shadowColor = 'transparent'; // reset shadow

  // Format Badge pill inside page
  ctx.fillStyle = theme.badgeBg;
  const badgeX = pageX + 16;
  const badgeY = pageY + 16;
  const badgeW = 120;
  const badgeH = 22;
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 4) : ctx.rect(badgeX, badgeY, badgeW, badgeH);
  ctx.fill();

  ctx.fillStyle = theme.header;
  ctx.font = 'bold 10px sans-serif';
  ctx.fillText(theme.badge, badgeX + 10, badgeY + 15);

  // Extension/File pill on right
  if (fileName) {
    const ext = fileName.split('.').pop()?.toUpperCase() || '';
    if (ext) {
      ctx.fillStyle = previewType === 'code' ? '#334155' : '#f1f5f9';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(pageX + pageWidth - 60, badgeY, 44, badgeH, 4) : ctx.rect(pageX + pageWidth - 60, badgeY, 44, badgeH);
      ctx.fill();
      ctx.fillStyle = previewType === 'code' ? '#94a3b8' : '#475569';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(ext.slice(0, 4), pageX + pageWidth - 52, badgeY + 15);
    }
  }

  // Document Title inside page
  ctx.fillStyle = previewType === 'code' ? '#f8fafc' : '#0f172a';
  ctx.font = 'bold 15px sans-serif';
  const cleanTitle = title.length > 40 ? title.substring(0, 38) + '...' : title;
  ctx.fillText(cleanTitle, pageX + 16, pageY + 62);

  // Decorative layout pattern according to type
  if (previewType === 'sheet') {
    // Render mini spreadsheet grid
    const startY = pageY + 80;
    const cols = 4;
    const colW = (pageWidth - 32) / cols;
    const rows = 4;
    for (let r = 0; r <= rows; r++) {
      const y = startY + r * 20;
      ctx.strokeStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(pageX + 16, y);
      ctx.lineTo(pageX + pageWidth - 16, y);
      ctx.stroke();

      if (r === 0) {
        ctx.fillStyle = '#f0fdf4';
        ctx.fillRect(pageX + 16, startY, pageWidth - 32, 20);
      }
    }
    for (let c = 0; c <= cols; c++) {
      const x = pageX + 16 + c * colW;
      ctx.strokeStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, startY + rows * 20);
      ctx.stroke();
    }
  } else if (previewType === 'slides') {
    // Render slide screen frame
    const slideW = pageWidth - 48;
    const slideH = 90;
    ctx.fillStyle = '#fff7ed';
    ctx.strokeStyle = '#fdba74';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(pageX + 24, pageY + 76, slideW, slideH, 6)
      : ctx.rect(pageX + 24, pageY + 76, slideW, slideH);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f97316';
    ctx.fillRect(pageX + 36, pageY + 92, 100, 8);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(pageX + 36, pageY + 110, slideW - 80, 5);
    ctx.fillRect(pageX + 36, pageY + 122, slideW - 120, 5);
    ctx.fillRect(pageX + 36, pageY + 134, slideW - 90, 5);
  } else if (previewType === 'code') {
    // Render code line bars
    const startY = pageY + 80;
    const codeColors = ['#f43f5e', '#38bdf8', '#fbbf24', '#4ade80', '#c084fc'];
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = codeColors[i % codeColors.length];
      ctx.fillRect(pageX + 20, startY + i * 16, 24, 6);
      ctx.fillStyle = '#475569';
      ctx.fillRect(pageX + 50, startY + i * 16, (pageWidth - 90) * (0.5 + 0.4 * Math.sin(i * 1.5)), 6);
    }
  } else {
    // Standard paragraph lines for PDF/DOC/TEXT
    const startY = pageY + 82;
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = i === 0 ? '#cbd5e1' : '#e2e8f0';
      const lineLen = i === 3 ? (pageWidth - 32) * 0.55 : pageWidth - 32;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(pageX + 16, startY + i * 18, lineLen, 7, 3) : ctx.rect(pageX + 16, startY + i * 18, lineLen, 7);
      ctx.fill();
    }
  }

  // Footer branding
  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px sans-serif';
  ctx.fillText('OBE360 COURSE DESIGN RESOURCE', pageX + 16, pageY + pageHeight - 14);

  return canvas.toDataURL('image/png');
}

/**
 * Generate a web link preview card snapshot
 */
export function generateLinkCanvasThumbnail(title: string, url: string): string {
  if (typeof document === 'undefined') return '';

  const canvas = document.createElement('canvas');
  const width = 480;
  const height = 270;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Clean domain extraction
  let domain = 'external-resource';
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    domain = parsed.hostname;
  } catch {
    domain = url.replace(/https?:\/\//, '').split('/')[0];
  }

  // Background
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, width, height);

  // Browser Window frame
  const frameX = 24;
  const frameY = 20;
  const frameW = width - 48;
  const frameH = height - 40;

  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,0.08)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(frameX, frameY, frameW, frameH, 8) : ctx.rect(frameX, frameY, frameW, frameH);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // Browser Chrome bar
  ctx.fillStyle = '#f1f5f9';
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(frameX, frameY, frameW, 36, [8, 8, 0, 0]) : ctx.rect(frameX, frameY, frameW, 36);
  ctx.fill();

  // Traffic lights
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(frameX + 16, frameY + 18, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.arc(frameX + 28, frameY + 18, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.arc(frameX + 40, frameY + 18, 4, 0, Math.PI * 2);
  ctx.fill();

  // URL address bar pill
  const pillX = frameX + 60;
  const pillY = frameY + 8;
  const pillW = frameW - 80;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(pillX, pillY, pillW, 20, 4) : ctx.rect(pillX, pillY, pillW, 20);
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.stroke();

  // Domain text
  ctx.fillStyle = '#0284c7';
  ctx.font = 'bold 9px monospace';
  ctx.fillText(`🔒 ${domain}`, pillX + 10, pillY + 14);

  // Content area
  ctx.fillStyle = '#e0f2fe';
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(frameX + 24, frameY + 56, 120, 20, 4) : ctx.rect(frameX + 24, frameY + 56, 120, 20);
  ctx.fill();
  ctx.fillStyle = '#0369a1';
  ctx.font = 'bold 9px sans-serif';
  ctx.fillText('ONLINE RESOURCE', frameX + 34, frameY + 70);

  // Title
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 15px sans-serif';
  const displayTitle = title.length > 36 ? title.substring(0, 34) + '...' : title;
  ctx.fillText(displayTitle, frameX + 24, frameY + 106);

  // Wireframe lines for webpage
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(frameX + 24, frameY + 126, frameW - 48, 6);
  ctx.fillRect(frameX + 24, frameY + 138, (frameW - 48) * 0.75, 6);
  ctx.fillRect(frameX + 24, frameY + 150, (frameW - 48) * 0.9, 6);

  // Button simulator
  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(frameX + 24, frameY + 172, 90, 26, 6) : ctx.rect(frameX + 24, frameY + 172, 90, 26);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px sans-serif';
  ctx.fillText('Open Web Link', frameX + 34, frameY + 188);

  return canvas.toDataURL('image/png');
}

/**
 * Generate a compressed image thumbnail from an image file
 */
export async function generateImageThumbnailFromFile(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) {
        resolve('');
        return;
      }
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 480;
        const maxH = 270;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxW) {
            height = Math.round((height * maxW) / width);
            width = maxW;
          }
        } else {
          if (height > maxH) {
            width = Math.round((width * maxH) / height);
            height = maxH;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

/**
 * Reads text content snippet for text/code/csv files
 */
export async function readTextFileSnippet(file: File, maxChars = 800): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) || '';
      resolve(text.substring(0, maxChars));
    };
    reader.onerror = () => resolve('');
    reader.readAsText(file);
  });
}

/**
 * Main function: Automatically generate preview thumbnail and metadata for an uploaded file
 */
export async function generatePreviewForFile(
  file: File,
  customTitle?: string
): Promise<{
  previewThumbnail: string;
  previewType: ResourcePreviewType;
  textContentSnippet?: string;
}> {
  const previewType = detectPreviewType('file', file.name, file.type);
  const title = customTitle || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

  let previewThumbnail = '';
  let textContentSnippet: string | undefined = undefined;

  if (previewType === 'image') {
    previewThumbnail = await generateImageThumbnailFromFile(file);
  } else if (previewType === 'code' || previewType === 'text') {
    textContentSnippet = await readTextFileSnippet(file);
    previewThumbnail = generateDocumentCanvasThumbnail(title, previewType, file.name);
  } else {
    previewThumbnail = generateDocumentCanvasThumbnail(title, previewType, file.name);
  }

  return {
    previewThumbnail,
    previewType,
    textContentSnippet,
  };
}

/**
 * Main function: Automatically generate preview thumbnail for an external link
 */
export function generatePreviewForLink(
  url: string,
  title: string
): {
  previewThumbnail: string;
  previewType: ResourcePreviewType;
} {
  return {
    previewThumbnail: generateLinkCanvasThumbnail(title, url),
    previewType: 'link',
  };
}
