'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/ImageUpload';
import { ImageData, UploadMode } from '@/types/upload';

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState<UploadMode>('upload');
  const [showUploadZone, setShowUploadZone] = useState(false);

  const handleImageSelect = (data: ImageData) => {
    // Store image data in sessionStorage for results page
    sessionStorage.setItem('costumeImage', JSON.stringify({
      dataUrl: data.dataUrl,
      fileName: data.file.name,
      fileSize: data.file.size,
    }));
    // Navigate directly to results
    router.push('/results');
  };

  return (
    <div className="min-h-screen">
      {/* Decorative Pumpkins */}
      <svg className="pumpkin-decoration pumpkin-1" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Pumpkin body segments */}
        <ellipse cx="100" cy="110" rx="75" ry="70" fill="#FF8C42"/>
        <ellipse cx="100" cy="110" rx="65" ry="65" fill="#FF7A2F"/>
        <ellipse cx="100" cy="110" rx="55" ry="60" fill="#FF6B35"/>

        {/* Vertical ridges */}
        <path d="M 70 50 Q 75 110 70 165" stroke="#D9541E" strokeWidth="2" opacity="0.5"/>
        <path d="M 85 45 Q 90 110 85 170" stroke="#D9541E" strokeWidth="2" opacity="0.5"/>
        <path d="M 115 45 Q 110 110 115 170" stroke="#D9541E" strokeWidth="2" opacity="0.5"/>
        <path d="M 130 50 Q 125 110 130 165" stroke="#D9541E" strokeWidth="2" opacity="0.5"/>

        {/* Curly stem */}
        <path d="M 100 45 Q 95 35 100 30 Q 105 25 100 20 Q 95 15 100 10" stroke="#6B7C3C" strokeWidth="5" fill="none" strokeLinecap="round"/>
        <ellipse cx="100" cy="47" rx="8" ry="5" fill="#7A8C4C"/>

        {/* Jack-o-lantern face - wider features */}
        <path d="M 65 85 L 85 108 L 65 108 Z" fill="#2C1810"/>
        <path d="M 135 85 L 115 108 L 135 108 Z" fill="#2C1810"/>
        <path d="M 95 100 L 105 120 L 95 120 Z" fill="#2C1810"/>
        <path d="M 60 130 Q 100 155 140 130 L 135 138 L 130 145 L 120 145 L 115 138 L 105 138 L 100 145 L 95 138 L 85 138 L 80 145 L 70 145 L 65 138 Z" fill="#2C1810"/>
      </svg>

      <svg className="pumpkin-decoration pumpkin-2" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Pumpkin body segments */}
        <ellipse cx="100" cy="110" rx="75" ry="70" fill="#FF8C42"/>
        <ellipse cx="100" cy="110" rx="65" ry="65" fill="#FF7A2F"/>
        <ellipse cx="100" cy="110" rx="55" ry="60" fill="#FF6B35"/>

        {/* Vertical ridges */}
        <path d="M 70 50 Q 75 110 70 165" stroke="#D9541E" strokeWidth="2" opacity="0.5"/>
        <path d="M 85 45 Q 90 110 85 170" stroke="#D9541E" strokeWidth="2" opacity="0.5"/>
        <path d="M 115 45 Q 110 110 115 170" stroke="#D9541E" strokeWidth="2" opacity="0.5"/>
        <path d="M 130 50 Q 125 110 130 165" stroke="#D9541E" strokeWidth="2" opacity="0.5"/>

        {/* Curly stem */}
        <path d="M 100 45 Q 105 35 100 30 Q 95 25 100 20 Q 105 15 100 10" stroke="#6B7C3C" strokeWidth="5" fill="none" strokeLinecap="round"/>
        <ellipse cx="100" cy="47" rx="8" ry="5" fill="#7A8C4C"/>

        {/* Jack-o-lantern face - wider features */}
        <path d="M 65 85 L 85 108 L 65 108 Z" fill="#2C1810"/>
        <path d="M 135 85 L 115 108 L 135 108 Z" fill="#2C1810"/>
        <path d="M 95 100 L 105 120 L 95 120 Z" fill="#2C1810"/>
        <path d="M 60 130 Q 100 155 140 130 L 135 138 L 130 145 L 120 145 L 115 138 L 105 138 L 100 145 L 95 138 L 85 138 L 80 145 L 70 145 L 65 138 Z" fill="#2C1810"/>
      </svg>

      <svg className="pumpkin-decoration pumpkin-3" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Pumpkin body segments */}
        <ellipse cx="100" cy="110" rx="75" ry="70" fill="#FF8C42"/>
        <ellipse cx="100" cy="110" rx="65" ry="65" fill="#FF7A2F"/>
        <ellipse cx="100" cy="110" rx="55" ry="60" fill="#FF6B35"/>

        {/* Vertical ridges */}
        <path d="M 70 50 Q 75 110 70 165" stroke="#D9541E" strokeWidth="2" opacity="0.5"/>
        <path d="M 85 45 Q 90 110 85 170" stroke="#D9541E" strokeWidth="2" opacity="0.5"/>
        <path d="M 115 45 Q 110 110 115 170" stroke="#D9541E" strokeWidth="2" opacity="0.5"/>
        <path d="M 130 50 Q 125 110 130 165" stroke="#D9541E" strokeWidth="2" opacity="0.5"/>

        {/* Curly stem */}
        <path d="M 100 45 Q 95 35 100 30 Q 105 25 100 20 Q 95 15 100 10" stroke="#6B7C3C" strokeWidth="5" fill="none" strokeLinecap="round"/>
        <ellipse cx="100" cy="47" rx="8" ry="5" fill="#7A8C4C"/>

        {/* Jack-o-lantern face - wider features */}
        <path d="M 65 85 L 85 108 L 65 108 Z" fill="#2C1810"/>
        <path d="M 135 85 L 115 108 L 135 108 Z" fill="#2C1810"/>
        <path d="M 95 100 L 105 120 L 95 120 Z" fill="#2C1810"/>
        <path d="M 60 130 Q 100 155 140 130 L 135 138 L 130 145 L 120 145 L 115 138 L 105 138 L 100 145 L 95 138 L 85 138 L 80 145 L 70 145 L 65 138 Z" fill="#2C1810"/>
      </svg>

      <svg className="pumpkin-decoration pumpkin-4" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Pumpkin body segments */}
        <ellipse cx="100" cy="110" rx="75" ry="70" fill="#FF8C42"/>
        <ellipse cx="100" cy="110" rx="65" ry="65" fill="#FF7A2F"/>
        <ellipse cx="100" cy="110" rx="55" ry="60" fill="#FF6B35"/>

        {/* Vertical ridges */}
        <path d="M 70 50 Q 75 110 70 165" stroke="#D9541E" strokeWidth="2" opacity="0.5"/>
        <path d="M 85 45 Q 90 110 85 170" stroke="#D9541E" strokeWidth="2" opacity="0.5"/>
        <path d="M 115 45 Q 110 110 115 170" stroke="#D9541E" strokeWidth="2" opacity="0.5"/>
        <path d="M 130 50 Q 125 110 130 165" stroke="#D9541E" strokeWidth="2" opacity="0.5"/>

        {/* Curly stem */}
        <path d="M 100 45 Q 105 35 100 30 Q 95 25 100 20 Q 105 15 100 10" stroke="#6B7C3C" strokeWidth="5" fill="none" strokeLinecap="round"/>
        <ellipse cx="100" cy="47" rx="8" ry="5" fill="#7A8C4C"/>

        {/* Jack-o-lantern face - wider features */}
        <path d="M 65 85 L 85 108 L 65 108 Z" fill="#2C1810"/>
        <path d="M 135 85 L 115 108 L 135 108 Z" fill="#2C1810"/>
        <path d="M 95 100 L 105 120 L 95 120 Z" fill="#2C1810"/>
        <path d="M 60 130 Q 100 155 140 130 L 135 138 L 130 145 L 120 145 L 115 138 L 105 138 L 100 145 L 95 138 L 85 138 L 80 145 L 70 145 L 65 138 Z" fill="#2C1810"/>
      </svg>

      <main className="container mx-auto px-6 py-16 md:py-24 max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Roast Reaper
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Upload your Halloween costume and let AI roast your costume
          </p>
        </div>

        {/* Process Steps */}
        {mode === 'upload' && (
          <div className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
              <div className="text-center">
                <div className="w-12 h-12 bg-[#FF6B35] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="font-semibold text-white mb-2 text-base">Upload your costume photo</h3>
                <p className="text-sm text-gray-400">No data stored</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-[#FF6B35] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="font-semibold text-white mb-2 text-base">AI gives you playful feedback</h3>
                <p className="text-sm text-gray-400">With voice narration</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-[#FF6B35] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="font-semibold text-white mb-2 text-base">Generate a perfected version</h3>
                <p className="text-sm text-gray-400">For fun</p>
              </div>
            </div>
          </div>
        )}

        {/* Upload/Preview Section */}
        <div className="mb-20">
          {mode === 'upload' && !showUploadZone && (
            <div className="text-center">
              <button
                onClick={() => setShowUploadZone(true)}
                className="px-8 py-3 bg-[#FF6B35] hover:bg-[#ff8555] text-white font-medium rounded-lg text-base transition-colors duration-200"
              >
                Upload Costume
              </button>
              <p className="text-sm text-gray-400 mt-4">
                We never save your photos — processed instantly in your browser
              </p>
            </div>
          )}
          {mode === 'upload' && showUploadZone && (
            <>
              <ImageUpload onImageSelect={handleImageSelect} />
              <p className="text-sm text-gray-400 mt-4 text-center">
                We never save your photos — processed instantly in your browser
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-800 pt-12 mt-20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
            <div>
              <h3 className="font-semibold text-white mb-3">About</h3>
              <p className="text-gray-400 leading-relaxed">
                A fun AI-powered app that analyzes Halloween costumes and provides humorous feedback.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3">Technology</h3>
              <p className="text-gray-400">Built with Gemini AI</p>
              <p className="text-gray-400">Next.js & React</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3">Privacy</h3>
              <p className="text-gray-400">No data stored</p>
              <p className="text-gray-400">Processed locally</p>
              <p className="text-gray-400">Privacy-first design</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3">Project</h3>
              <p className="text-gray-400">Hack-or-Treat 2025</p>
              <a href="#" className="text-[#FF6B35] hover:text-[#ff8555] transition-colors">
                View on Devpost
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-600 text-xs">
            <p>&copy; 2025 Roast Reaper. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
