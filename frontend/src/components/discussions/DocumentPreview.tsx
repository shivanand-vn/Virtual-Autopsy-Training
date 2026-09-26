import React from 'react';
import { FileText, Download, ExternalLink, FileSpreadsheet, Image as ImageIcon, Eye } from 'lucide-react';
import type { SharedDocument } from '../../types/discussions';

interface DocumentPreviewProps {
  document: SharedDocument;
  onView?: () => void;
  compact?: boolean;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  document,
  onView,
  compact = false
}) => {
  const getFileIcon = () => {
    switch (document.fileType) {
      case 'pdf':
        return <FileText className="w-6 h-6 text-red-500" />;
      case 'dicom':
        return <FileSpreadsheet className="w-6 h-6 text-amber-500" />;
      case 'image':
        return <ImageIcon className="w-6 h-6 text-blue-500" />;
      default:
        return <FileText className="w-6 h-6 text-amber-500" />;
    }
  };

  const getBadgeStyle = () => {
    switch (document.fileType) {
      case 'pdf':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'dicom':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'image':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 transition-colors">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="p-2 bg-white rounded-lg shadow-xs border border-slate-100 flex-shrink-0">
            {getFileIcon()}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-[#0A192F] truncate">{document.title}</h4>
            <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
              <span className={`px-1.5 py-0.2 rounded border text-[10px] font-bold uppercase ${getBadgeStyle()}`}>
                {document.fileType}
              </span>
              <span>{document.fileSize}</span>
            </div>
          </div>
        </div>
        <a
          href={document.downloadUrl || '#'}
          onClick={(e) => {
            if (!document.downloadUrl) e.preventDefault();
          }}
          download
          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors flex-shrink-0"
          title="Download File"
        >
          <Download className="w-4 h-4" />
        </a>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-slate-900 to-[#0A192F] text-white p-5 rounded-2xl shadow-lg border border-slate-800 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start space-x-3.5 min-w-0">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 flex-shrink-0">
            {getFileIcon()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${getBadgeStyle()}`}>
                {document.fileType} Material
              </span>
              <span className="text-xs text-slate-400">{document.fileSize}</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
              {document.title}
            </h3>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-slate-400 flex items-center space-x-1.5">
          <Eye className="w-3.5 h-3.5 text-amber-400" />
          <span>Attached Course Reference Document</span>
        </span>

        <div className="flex items-center space-x-2">
          {onView && (
            <button
              onClick={onView}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/15"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          )}
          <a
            href={document.downloadUrl || '#'}
            onClick={(e) => {
              if (!document.downloadUrl) e.preventDefault();
            }}
            download
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-extrabold shadow-md shadow-amber-500/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </a>
        </div>
      </div>
    </div>
  );
};
