import React, { useRef, useState } from 'react';
import { FileUp, FileText, CheckCircle2, X } from 'lucide-react';

interface FileUploadProps {
  label: string;
  required?: boolean;
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  required = false,
  onFileSelect,
  selectedFile,
  error,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const validateAndSetFile = (file: File) => {
    setLocalError(null);

    if (file.type !== 'application/pdf') {
      setLocalError('Only PDF files are allowed.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10 MB limit
      setLocalError('File size exceeds maximum limit of 10 MB.');
      return;
    }

    onFileSelect(file);
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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    onFileSelect(null);
    setLocalError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayError = error || localError;

  return (
    <div className="w-full space-y-1.5">
      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
        {label} {required && <span className="text-amber-600">*</span>}
      </label>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="application/pdf"
        className="hidden"
      />

      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full py-6 px-4 rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center ${
            isDragging
              ? 'border-amber-500 bg-amber-50/50 scale-[0.99]'
              : displayError
              ? 'border-red-300 bg-red-50/30 hover:bg-red-50/50'
              : 'border-slate-200 hover:border-amber-400 bg-slate-50/40 hover:bg-amber-50/20'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-amber-100/70 border border-amber-200 flex items-center justify-center text-amber-600 mb-2.5 shadow-sm group-hover:scale-110 transition-transform duration-200">
            <FileUp className="w-6 h-6 text-amber-600" />
          </div>
          <p className="text-sm font-bold text-navy-950">
            Upload your CV
          </p>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            PDF format • Maximum 10 MB
          </p>
        </div>
      ) : (
        <div className="w-full p-4 rounded-xl border border-amber-300/80 bg-gradient-to-r from-amber-50/40 to-slate-50 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-300 flex items-center justify-center shrink-0 text-amber-600">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-navy-950 truncate">
                  {selectedFile.name}
                </p>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              </div>
              <p className="text-xs text-slate-500 font-mono">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to submit
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Remove file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {displayError && (
        <p className="text-xs text-red-500 font-medium pl-0.5">{displayError}</p>
      )}
    </div>
  );
};
