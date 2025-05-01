'use client';

import React, { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

export interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  label?: string;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  showSelectedFiles?: boolean;
}

export function FileUpload({
  onFilesSelected,
  label,
  accept,
  multiple = false,
  disabled = false,
  error,
  className,
  showSelectedFiles = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    },
    []
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        e.dataTransfer.dropEffect = 'copy';
        setIsDragging(true);
      }
    },
    [disabled]
  );

  const handleFilesSelected = useCallback(
    (files: FileList | null) => {
      if (files && files.length > 0) {
        const fileArray = Array.from(files);
        setSelectedFiles(fileArray);
        onFilesSelected(fileArray);
      }
    },
    [onFilesSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (!disabled) {
        const { files } = e.dataTransfer;
        handleFilesSelected(files);
      }
    },
    [disabled, handleFilesSelected]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { files } = e.target;
      handleFilesSelected(files);
    },
    [handleFilesSelected]
  );

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const renderSelectedFiles = () => {
    if (!showSelectedFiles || selectedFiles.length === 0) {
      return null;
    }

    return (
      <div className="mt-2">
        <p className="text-sm font-medium text-gray-700">Selected files:</p>
        <ul className="mt-1 text-sm text-gray-500 space-y-1">
          {selectedFiles.map((file, index) => (
            <li key={`${file.name}-${index}`}>{file.name}</li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="w-full">
      <div
        data-testid="file-upload-container"
        className={cn(
          'flex flex-col items-center justify-center w-full p-4 border-2 border-dashed rounded-lg',
          isDragging ? 'border-primary-600 bg-primary-50' : 'border-gray-300',
          error ? 'border-red-500' : '',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50',
          className
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <svg
          className={cn(
            'w-10 h-10 mb-3',
            error ? 'text-red-500' : isDragging ? 'text-primary-600' : 'text-gray-400'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <p className="mb-2 text-sm font-semibold">
          {label || 'Drag and drop files here'}
        </p>
        <p className="text-xs text-gray-500">
          {!label && 'or click to browse'}
        </p>
        <input
          data-testid="file-input"
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleFileInputChange}
        />
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
      
      {renderSelectedFiles()}
    </div>
  );
} 