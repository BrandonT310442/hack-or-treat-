'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface CostumeData {
  dataUrl: string;
  fileName: string;
  fileSize: number;
}

type VoiceOption = 'barack-obama' | 'spongebob' | 'patrick' | 'joker' | 'the-rock' | 'elmo' | 'squidward';

const VOICE_OPTIONS: Array<{ id: VoiceOption; name: string; description: string }> = [
  { id: 'barack-obama', name: 'Barack Obama', description: 'Presidential roast' },
  { id: 'spongebob', name: 'SpongeBob', description: 'I\'m ready!' },
  { id: 'patrick', name: 'Patrick', description: 'Is mayonnaise an instrument?' },
  { id: 'joker', name: 'Joker', description: 'Why so serious?' },
  { id: 'the-rock', name: 'The Rock', description: 'Can you smell what\'s cooking?' },
  { id: 'elmo', name: 'Elmo', description: 'Elmo loves costumes!' },
  { id: 'squidward', name: 'Squidward', description: 'Bold and brash' },
];

export default function ResultsPage() {
  const router = useRouter();
  const [costumeData, setCostumeData] = useState<CostumeData | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [roastText, setRoastText] = useState<string>('');
  const [isLoadingRoast, setIsLoadingRoast] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>('barack-obama');

  useEffect(() => {
    const storedData = sessionStorage.getItem('costumeImage');
    if (storedData) {
      setCostumeData(JSON.parse(storedData));
    } else {
      router.push('/');
    }
  }, [router]);

  // Generate roast when costume data is loaded
  useEffect(() => {
    const generateRoast = async () => {
      if (!costumeData || roastText) return;

      setIsLoadingRoast(true);
      try {
        const response = await fetch('/api/generate-roast', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageData: costumeData.dataUrl,
          }),
        });

        const data = await response.json();

        if (response.ok && data.roast) {
          setRoastText(data.roast);
        } else {
          setRoastText('Failed to generate roast. Please refresh the page to try again.');
        }
      } catch (error) {
        console.error('Error generating roast:', error);
        setRoastText('Failed to generate roast. Please refresh the page to try again.');
      } finally {
        setIsLoadingRoast(false);
      }
    };

    generateRoast();
  }, [costumeData, roastText]);

  const handlePlayRoast = () => {
    if (!roastText || isPlaying) return;

    // Use Web Speech API for text-to-speech
    const utterance = new SpeechSynthesisUtterance(roastText);
    utterance.rate = 0.9; // Slightly slower for better clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Track progress
    utterance.onstart = () => {
      setIsPlaying(true);
      setAudioProgress(0);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setAudioProgress(100);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      console.error('Speech synthesis error');
    };

    // Simulate progress (since Web Speech API doesn't provide real-time progress)
    const words = roastText.split(' ').length;
    const estimatedDuration = words * 400; // Rough estimate: 400ms per word
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 1;
      setAudioProgress(Math.min(progress, 99));
      if (progress >= 100) {
        clearInterval(progressInterval);
      }
    }, estimatedDuration / 100);

    utterance.onend = () => {
      setIsPlaying(false);
      setAudioProgress(100);
      clearInterval(progressInterval);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleStopRoast = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setAudioProgress(0);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing || !costumeData) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsProcessing(true);

    try {
      // Call the image modification API
      const response = await fetch('/api/modify-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: costumeData.dataUrl,
          prompt: userMessage,
          conversationHistory: [],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to modify image');
      }

      // If a modified image URL is returned, update the generated image
      if (data.modifiedImageUrl || data.modifiedImageData) {
        setGeneratedImage(data.modifiedImageUrl || data.modifiedImageData);
      }
    } catch (error) {
      console.error('Error modifying image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!costumeData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0f]">
      {/* Top Section - Voice Selection & Roast Player */}
      <div className="bg-[#1a1a1a] border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          {/* Voice Selection Dropdown */}
          <div className="flex items-center gap-3">
            <label htmlFor="voice-select" className="text-white text-sm font-medium whitespace-nowrap">
              Roast Voice:
            </label>
            <select
              id="voice-select"
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value as VoiceOption)}
              className="bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
            >
              {VOICE_OPTIONS.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name}
                </option>
              ))}
            </select>
          </div>

          {/* Roast Player */}
          <div className="flex-1 flex items-center gap-4">
            <button
              onClick={isPlaying ? handleStopRoast : handlePlayRoast}
              disabled={isLoadingRoast || !roastText}
              className="w-10 h-10 bg-[#FF6B35] hover:bg-[#ff8555] disabled:bg-gray-700 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors flex-shrink-0"
            >
              {isLoadingRoast ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : isPlaying ? (
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>

            <div className="flex-1">
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-[#FF6B35] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${audioProgress}%` }}
                ></div>
              </div>
            </div>

            <div className="text-gray-400 text-sm min-w-[60px] text-right">
              {isLoadingRoast ? 'Loading...' : isPlaying ? 'Playing...' : 'Ready'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - 2 Columns */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Half - Original Image */}
        <div className="w-1/2 p-6 border-r border-gray-800 flex flex-col">
          <h2 className="text-white text-xl font-semibold mb-4 text-center">Original Costume</h2>
          <div className="flex-1 relative bg-black rounded-lg overflow-hidden">
            <Image
              src={costumeData.dataUrl}
              alt="Original costume"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Right Half - Modified Image + Input */}
        <div className="w-1/2 flex flex-col">
          {/* Modified Image */}
          <div className="flex-1 p-6 pb-0 flex flex-col">
            <h2 className="text-white text-xl font-semibold mb-4 text-center">AI Modified Costume</h2>
            <div className="flex-1 relative bg-black rounded-lg overflow-hidden">
              {generatedImage ? (
                <Image
                  src={generatedImage}
                  alt="AI modified costume"
                  fill
                  className="object-contain"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <div className="text-4xl mb-4">✨</div>
                    <p className="text-lg mb-2">No modifications yet</p>
                    <p className="text-sm">Use the input below to request changes</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Modification Input */}
          <div className="p-6 border-t border-gray-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Describe your modification (e.g., 'add a witch hat')..."
                className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                disabled={isProcessing}
              />
              <button
                onClick={handleSendMessage}
                disabled={isProcessing || !inputMessage.trim()}
                className="px-6 py-3 bg-[#FF6B35] hover:bg-[#ff8555] disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-lg transition-colors"
              >
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Modify'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
