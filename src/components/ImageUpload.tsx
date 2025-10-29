'use client';

import { useRef, useState } from 'react';
import { validateImageFile, convertFileToDataUrl } from '@/utils/imageValidation';
import { ImageData } from '@/types/upload';

interface ImageUploadProps {
  onImageSelect: (imageData: ImageData) => void;
}

export default function ImageUpload({ onImageSelect }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setError(null);
    setIsProcessing(true);

    try {
      const validation = validateImageFile(file);

      if (!validation.isValid) {
        setError(validation.error || 'Invalid file');
        setIsProcessing(false);
        return;
      }

      const dataUrl = await convertFileToDataUrl(file);

      const imageData: ImageData = {
        file,
        dataUrl,
        isValid: true,
      };

      onImageSelect(imageData);
    } catch (err) {
      setError('Failed to process image. Please try again.');
      console.error('Error processing file:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-200 cursor-pointer ${
          isDragging
            ? 'border-gray-400 bg-gray-800/20'
            : 'border-gray-700 hover:border-gray-600 bg-[#1a1a1a]'
        } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        aria-label="Upload costume image"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
          aria-hidden="true"
        />

        {isProcessing ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-[#FF6B35] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-lg text-gray-300">Processing your costume...</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <svg
                className="w-16 h-16 mx-auto text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
            </div>

            <p className="text-base text-gray-300 mb-2">
              Drag & drop images, or any file
            </p>
            <p className="text-sm text-gray-400 mb-6">
              or <button type="button" className="text-[#FF6B35] hover:text-[#ff8555] underline font-medium" onClick={(e) => { e.stopPropagation(); handleClick(); }}>browse files</button> on your computer
            </p>

            <p className="text-xs text-gray-500 mt-8">
              Supported: JPG, PNG, WebP (max 20MB)
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-900/20 border border-red-800 rounded-lg">
          <p className="text-red-400 text-center text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
