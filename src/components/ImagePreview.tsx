'use client';

import { ImageData } from '@/types/upload';
import { formatFileSize } from '@/utils/imageValidation';
import Image from 'next/image';

interface ImagePreviewProps {
  imageData: ImageData;
  onReset: () => void;
  onRoastMe: () => void;
}

export default function ImagePreview({ imageData, onReset, onRoastMe }: ImagePreviewProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-gray-800">
        <h3 className="text-xl font-semibold text-white mb-6 text-center">
          Ready to roast
        </h3>

        <div className="relative w-full aspect-square max-w-lg mx-auto mb-6 rounded-xl overflow-hidden border border-gray-700 bg-black">
          <Image
            src={imageData.dataUrl}
            alt="Uploaded costume"
            fill
            className="object-contain"
            priority
          />
        </div>

        <div className="mb-6 text-center">
          <p className="text-gray-400 text-sm">
            <span className="font-medium">File:</span> {imageData.file.name}
          </p>
          <p className="text-gray-400 text-sm">
            <span className="font-medium">Size:</span> {formatFileSize(imageData.file.size)}
          </p>
        </div>

        {imageData.error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg">
            <p className="text-red-400 text-center text-sm">{imageData.error}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onReset}
            className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200 text-sm"
          >
            Choose Different Photo
          </button>

          <button
            onClick={onRoastMe}
            disabled={!imageData.isValid}
            className={`px-8 py-2.5 font-medium rounded-lg text-sm transition-colors duration-200 ${
              imageData.isValid
                ? 'bg-[#FF6B35] hover:bg-[#ff8555] text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            Roast My Costume
          </button>
        </div>
      </div>
    </div>
  );
}
