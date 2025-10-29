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

// Map voice options to Fish Audio reference IDs
const VOICE_REFERENCE_MAP: Record<VoiceOption, string> = {
  'barack-obama': '4ce7e917cedd4bc2bb2e6ff3a46acaa1',
  'spongebob': '54e3a85ac9594ffa83264b8a494b901b',
  'patrick': 'd75c270eaee14c8aa1e9e980cc37cf1b',
  'joker': 'fad5a5a6770e47019f566b8f8c0ff609',
  'the-rock': '7cc3a7aca00a489eac430d35fd6203e3',
  'elmo': '193f7f8f649b418382885c5fb4fb7109',
  'squidward': 'dcc29b2dcbc04278bc5a137debea52ec',
};

export default function ResultsPage() {
  const router = useRouter();
  const [costumeData, setCostumeData] = useState<CostumeData | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [modificationAnalysis, setModificationAnalysis] = useState<string | null>(null);
  const [roastText, setRoastText] = useState<string>('');
  const [isLoadingRoast, setIsLoadingRoast] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>('barack-obama');

  // Analysis data
  const [costumeType, setCostumeType] = useState<string>('');
  const [failPoints, setFailPoints] = useState<string[]>([]);
  const [overallAssessment, setOverallAssessment] = useState<string>('');
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

  // Error states
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [roastError, setRoastError] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Audio element ref
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  useEffect(() => {
    const storedData = sessionStorage.getItem('costumeImage');
    if (storedData) {
      setCostumeData(JSON.parse(storedData));
    } else {
      router.push('/');
    }
  }, [router]);

  // Analyze costume and generate roast when costume data is loaded
  useEffect(() => {
    const analyzeAndGenerateRoast = async () => {
      if (!costumeData || roastText) return;

      // Step 1: Analyze the costume
      setIsLoadingAnalysis(true);
      setAnalysisError(null);

      try {
        const analyzeResponse = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: costumeData.dataUrl,
          }),
        });

        const analyzeData = await analyzeResponse.json();

        if (!analyzeResponse.ok || !analyzeData.success) {
          throw new Error(analyzeData.error || 'Failed to analyze costume');
        }

        // Store analysis data
        setCostumeType(analyzeData.data.costumeType);
        setFailPoints(analyzeData.data.failPoints || []);
        setOverallAssessment(analyzeData.data.overallAssessment);

        // Step 2: Generate roast using analysis data
        setIsLoadingRoast(true);
        setRoastError(null);

        const roastResponse = await fetch('/api/generate-roast', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            costumeType: analyzeData.data.costumeType,
            failPoints: analyzeData.data.failPoints || [],
            analysis: analyzeData.data.overallAssessment,
          }),
        });

        const roastData = await roastResponse.json();

        if (!roastResponse.ok || !roastData.success) {
          throw new Error(roastData.error || 'Failed to generate roast');
        }

        setRoastText(roastData.data.roast);
      } catch (error) {
        console.error('Error in analyze/roast flow:', error);
        const errorMessage = error instanceof Error ? error.message : 'Something went wrong';

        // Set appropriate error
        if (!costumeType) {
          setAnalysisError(errorMessage);
        } else {
          setRoastError(errorMessage);
        }
      } finally {
        setIsLoadingAnalysis(false);
        setIsLoadingRoast(false);
      }
    };

    analyzeAndGenerateRoast();
  }, [costumeData, roastText]);

  const handlePlayRoast = async () => {
    if (!roastText || isPlaying || isLoadingAudio) return;

    setIsLoadingAudio(true);
    setAudioError(null);

    try {
      // Get the reference ID for the selected voice
      const referenceId = VOICE_REFERENCE_MAP[selectedVoice];

      // Call the generate-audio API
      const response = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: roastText,
          reference_id: referenceId || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }

      // Get audio blob
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create and configure audio element
      const audio = new Audio(audioUrl);

      audio.onloadedmetadata = () => {
        setIsLoadingAudio(false);
        setIsPlaying(true);
        setAudioProgress(0);
        audio.play();
      };

      audio.ontimeupdate = () => {
        if (audio.duration) {
          const progress = (audio.currentTime / audio.duration) * 100;
          setAudioProgress(progress);
        }
      };

      audio.onended = () => {
        setIsPlaying(false);
        setAudioProgress(100);
        URL.revokeObjectURL(audioUrl);
        setAudioElement(null);
      };

      audio.onerror = () => {
        setIsPlaying(false);
        setIsLoadingAudio(false);
        setAudioError('Failed to play audio');
        URL.revokeObjectURL(audioUrl);
        setAudioElement(null);
      };

      setAudioElement(audio);
    } catch (error) {
      console.error('Error generating/playing audio:', error);
      setAudioError('Failed to generate audio. Please try again.');
      setIsLoadingAudio(false);
    }
  };

  const handleStopRoast = () => {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setIsPlaying(false);
      setAudioProgress(0);
      setAudioElement(null);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing || !costumeData) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsProcessing(true);
    setModificationAnalysis(null);

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
        const errorMsg = data.error || 'Failed to modify image';
        console.error('API Error:', errorMsg, data);
        setModificationAnalysis(`Error: ${errorMsg}`);
        setIsProcessing(false);
        return;
      }

      // Display analysis text from API
      if (data.analysis) {
        setModificationAnalysis(data.analysis);
      }

      // If a modified image URL is returned, update the generated image
      if (data.modifiedImageUrl || data.modifiedImageData) {
        setGeneratedImage(data.modifiedImageUrl || data.modifiedImageData);
      }
    } catch (error) {
      console.error('Error modifying image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setModificationAnalysis(`Failed to process modification request: ${errorMessage}`);
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
              disabled={isLoadingRoast || isLoadingAudio || !roastText}
              className="w-10 h-10 bg-[#FF6B35] hover:bg-[#ff8555] disabled:bg-gray-700 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors flex-shrink-0"
            >
              {isLoadingRoast || isLoadingAudio ? (
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

            <div className="text-gray-400 text-sm min-w-[80px] text-right">
              {isLoadingAnalysis ? 'Analyzing...' : isLoadingRoast ? 'Generating...' : isLoadingAudio ? 'Loading...' : isPlaying ? 'Playing...' : 'Ready'}
            </div>
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {(analysisError || roastError || audioError) && (
        <div className="bg-red-900/20 border-b border-red-800 px-6 py-3">
          <div className="max-w-7xl mx-auto">
            <p className="text-red-400 text-sm">
              {analysisError || roastError || audioError}
            </p>
          </div>
        </div>
      )}

      {/* Main Content - 2 Columns */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Half - Original Image */}
        <div className="w-1/2 p-6 border-r border-gray-800 flex flex-col">
          <h2 className="text-white text-xl font-semibold mb-4 text-center">Original Costume</h2>
          <div className="flex-1 relative bg-black rounded-lg overflow-hidden mb-4">
            <Image
              src={costumeData.dataUrl}
              alt="Original costume"
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Costume Analysis */}
          {costumeType && (
            <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-800">
              <h3 className="text-white font-semibold mb-2">Costume Analysis</h3>
              <p className="text-[#FF6B35] text-sm mb-2">
                Detected: {costumeType}
              </p>
              {failPoints.length > 0 && (
                <div className="mt-2">
                  <p className="text-gray-400 text-xs mb-1">Issues Found:</p>
                  <ul className="list-disc list-inside text-gray-400 text-xs space-y-1">
                    {failPoints.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
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
              ) : modificationAnalysis ? (
                <div className="flex items-center justify-center h-full text-gray-400 p-8">
                  <div className="text-center max-w-lg">
                    <div className="text-4xl mb-4">🎨</div>
                    <p className="text-lg mb-4 text-white">Modification Analysis</p>
                    <p className="text-sm leading-relaxed mb-4">{modificationAnalysis}</p>
                    <p className="text-xs text-gray-500 italic">
                      Note: Visual image generation coming soon!
                    </p>
                  </div>
                </div>
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
