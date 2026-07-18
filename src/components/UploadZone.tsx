'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';

interface UploadZoneProps {
  onAnalyze: (file: File) => void;
  isAnalyzing: boolean;
}

export default function UploadZone({ onAnalyze, isAnalyzing }: UploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFile = (file: File): boolean => {
    const validExtensions = ['pdf', 'docx', 'txt'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !validExtensions.includes(fileExtension)) {
      setError('Unsupported file type. Please upload a PDF, DOCX, or TXT file.');
      return false;
    }

    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      setError('File is too large. Maximum size allowed is 5MB.');
      return false;
    }

    setError(null);
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const triggerFileInput = () => {
    inputRef.current?.click();
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleAnalyzeClick = () => {
    if (selectedFile) {
      onAnalyze(selectedFile);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Upload Box */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={selectedFile ? undefined : triggerFileInput}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
          selectedFile
            ? 'border-blue-200 bg-blue-50/20'
            : dragActive
            ? 'border-blue-500 bg-blue-50/60 scale-[1.01]'
            : 'border-slate-300 hover:border-blue-400 bg-white hover:bg-slate-50/50 cursor-pointer'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleFileChange}
          className="hidden"
          disabled={isAnalyzing}
        />

        {/* Upload State Icons & Messages */}
        {!selectedFile ? (
          <>
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm">
              <UploadCloud className="w-7 h-7" />
            </div>
            <h3 className="mb-1.5 text-base font-semibold text-slate-800">
              Drag & drop your resume
            </h3>
            <p className="mb-1 text-sm text-slate-500">
              or <span className="font-semibold text-blue-600">browse your computer</span>
            </p>
            <p className="text-xs text-slate-400">
              Supports PDF, Word (DOCX), or Text (TXT) files up to 5MB
            </p>
          </>
        ) : (
          <div className="w-full flex flex-col items-center">
            <div className="mb-3.5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <FileText className="w-6 h-6" />
            </div>
            
            <div className="mb-2 max-w-md">
              <p className="text-sm font-semibold text-slate-800 truncate" title={selectedFile.name}>
                {selectedFile.name}
              </p>
              <p className="text-xs text-slate-400 font-medium">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 rounded-full px-2.5 py-0.5 border border-emerald-100">
                <CheckCircle className="w-3 h-3" /> Ready
              </span>
              
              <button
                onClick={clearFile}
                disabled={isAnalyzing}
                className="flex items-center justify-center rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                title="Remove file"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-red-50 border border-red-100 p-3.5 text-sm text-red-700 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Action Button */}
      {selectedFile && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleAnalyzeClick}
            disabled={isAnalyzing}
            className="relative flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 px-8 text-base font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:bg-blue-800 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none w-full sm:w-auto"
          >
            <span>Analyze Resume</span>
          </button>
        </div>
      )}
    </div>
  );
}
