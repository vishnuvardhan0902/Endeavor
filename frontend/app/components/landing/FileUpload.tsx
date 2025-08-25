"use client";
import React, { useRef } from 'react';

interface FileUploadProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileChange, loading }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="flex items-center justify-center w-full max-w-md">
      <label
        htmlFor="dropzone-file"
        className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-blue-400 rounded-lg cursor-pointer bg-slate-900 hover:bg-slate-800 transition-all shadow-md"
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <svg
            className="w-10 h-10 mb-4 text-blue-400"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 16"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
            />
          </svg>
          <p className="mb-2 text-sm text-blue-300">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-blue-400">PDF, DOC, DOCX (MAX. 10MB)</p>
        </div>
        <input
          id="dropzone-file"
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx"
          ref={fileInputRef}
          onChange={onFileChange}
          disabled={loading}
        />
      </label>
    </div>
  );
};
