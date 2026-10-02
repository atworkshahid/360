import React, { useState } from 'react';
import {
  FileText,
  FileSpreadsheet,
  FileCode,
  FileArchive,
  Image as ImageIcon,
  Presentation,
  Globe,
  Film,
  Music,
  File as GenericFileIcon,
  ExternalLink,
  Eye,
  Download,
  Copy,
  Check,
  ZoomIn,
} from 'lucide-react';
import { ResourceItem, ResourcePreviewType } from '../../types';
import { formatFileSize, getFileTypeBadge } from '../../services/resourceLibraryService';

interface ResourcePreviewProps {
  item: ResourceItem;
  size?: 'sm' | 'md' | 'lg' | 'detail';
  onQuickPreview?: (item: ResourceItem) => void;
  showOverlay?: boolean;
}

export const getPreviewTypeIcon = (previewType?: ResourcePreviewType, className = 'w-5 h-5') => {
  switch (previewType) {
    case 'pdf':
      return <FileText className={`${className} text-rose-600`} />;
    case 'doc':
      return <FileText className={`${className} text-blue-600`} />;
    case 'sheet':
      return <FileSpreadsheet className={`${className} text-emerald-600`} />;
    case 'slides':
      return <Presentation className={`${className} text-amber-600`} />;
    case 'code':
      return <FileCode className={`${className} text-indigo-500`} />;
    case 'text':
      return <FileText className={`${className} text-slate-600`} />;
    case 'image':
      return <ImageIcon className={`${className} text-purple-600`} />;
    case 'archive':
      return <FileArchive className={`${className} text-amber-600`} />;
    case 'audio':
      return <Music className={`${className} text-pink-600`} />;
    case 'video':
      return <Film className={`${className} text-violet-600`} />;
    case 'link':
      return <Globe className={`${className} text-sky-600`} />;
    default:
      return <GenericFileIcon className={`${className} text-slate-500`} />;
  }
};

export const ResourceThumbnail: React.FC<ResourcePreviewProps> = ({
  item,
  size = 'md',
  onQuickPreview,
  showOverlay = true,
}) => {
  const [imageError, setImageError] = useState(false);
  const badge = getFileTypeBadge(item);

  // Compact icon view for table or small cards
  if (size === 'sm') {
    return (
      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center relative group">
        {item.previewThumbnail && !imageError ? (
          <img
            src={item.previewThumbnail}
            alt={item.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-slate-50">
            {getPreviewTypeIcon(item.previewType, 'w-5 h-5')}
          </div>
        )}
      </div>
    );
  }

  // Medium banner view for grid cards (approx 16:9 ratio)
  if (size === 'md') {
    return (
      <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 mb-3.5 relative group select-none">
        {item.previewThumbnail && !imageError ? (
          <img
            src={item.previewThumbnail}
            alt={item.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          // Vector styled document preview fallback
          <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span
                className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md border ${badge.bg} ${badge.text} ${badge.border}`}
              >
                {badge.label}
              </span>
              <div className="p-1.5 rounded-lg bg-white shadow-2xs border border-slate-200/60">
                {getPreviewTypeIcon(item.previewType, 'w-4 h-4')}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 line-clamp-1">{item.title}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {item.type === 'link' ? 'Web Resource' : formatFileSize(item.fileSize)}
              </div>
            </div>
            {/* Simulated document lines */}
            <div className="space-y-1.5 pt-1">
              <div className="h-1 bg-slate-200 rounded-full w-full" />
              <div className="h-1 bg-slate-200 rounded-full w-3/4" />
            </div>
          </div>
        )}

        {/* Type Badge Pill floating on top-left */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span
            className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md border shadow-2xs backdrop-blur-xs ${badge.bg}/90 ${badge.text} ${badge.border}`}
          >
            {badge.label}
          </span>
        </div>

        {/* Hover Quick Preview Action */}
        {showOverlay && onQuickPreview && (
          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-2xs z-20">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onQuickPreview(item);
              }}
              className="px-3 py-1.5 bg-white text-slate-900 text-xs font-bold rounded-lg shadow-lg hover:bg-slate-50 transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-600" />
              <span>Quick Preview</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // Large or Detail view
  return (
    <div className="w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative group">
      {item.previewThumbnail && !imageError ? (
        <div className="relative max-h-72 flex items-center justify-center bg-slate-900/5">
          <img
            src={item.previewThumbnail}
            alt={item.title}
            onError={() => setImageError(true)}
            className="max-h-72 w-full object-contain"
          />
        </div>
      ) : (
        <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center text-center justify-center min-h-[180px]">
          <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center mb-3">
            {getPreviewTypeIcon(item.previewType, 'w-7 h-7')}
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">{item.title}</h4>
          <p className="text-xs text-slate-500">
            {item.type === 'link' ? item.url : `${item.fileName} (${formatFileSize(item.fileSize)})`}
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Interactive File Content Inspector for detail and full preview modals
 */
export const FileContentPreviewInspector: React.FC<{ item: ResourceItem }> = ({ item }) => {
  const [copied, setCopied] = useState(false);

  const handleCopySnippet = () => {
    if (item.textContentSnippet) {
      navigator.clipboard.writeText(item.textContentSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Image preview
  if (item.previewType === 'image' && item.url) {
    return (
      <div className="space-y-2">
        <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center p-2 max-h-80">
          <img
            src={item.url}
            alt={item.title}
            className="max-h-72 w-auto max-w-full object-contain rounded-lg shadow-md"
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
          <span>Format: {item.fileName?.split('.').pop()?.toUpperCase() || 'Image'}</span>
          <span>{formatFileSize(item.fileSize)}</span>
        </div>
      </div>
    );
  }

  // Text, CSV, or Source Code preview
  if ((item.previewType === 'text' || item.previewType === 'code') && item.textContentSnippet) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          <span className="flex items-center space-x-1.5">
            <FileCode className="w-3.5 h-3.5 text-indigo-600" />
            <span>Document Content Preview (Snippet)</span>
          </span>
          <button
            type="button"
            onClick={handleCopySnippet}
            className="px-2 py-0.5 rounded-md hover:bg-slate-200 text-slate-700 transition flex items-center space-x-1 cursor-pointer font-medium"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <div className="rounded-xl overflow-hidden border border-slate-300 bg-slate-900 text-slate-200 p-3.5 font-mono text-xs max-h-56 overflow-y-auto leading-relaxed shadow-inner">
          <pre className="whitespace-pre-wrap">{item.textContentSnippet}</pre>
        </div>
      </div>
    );
  }

  // PDF or Office Documents preview
  return (
    <div className="space-y-2">
      <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
        <ResourceThumbnail item={item} size="detail" showOverlay={false} />
      </div>
    </div>
  );
};
