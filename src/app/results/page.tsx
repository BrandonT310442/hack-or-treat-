'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Play, Pause, Mic2, Sparkles, Camera, Flame, Wand2, AlertCircle, ArrowLeft, ImagePlus } from 'lucide-react';

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

  // Meme generation state
  const [generatedMeme, setGeneratedMeme] = useState<string | null>(null);
  const [isGeneratingMeme, setIsGeneratingMeme] = useState(false);
  const [memeError, setMemeError] = useState<string | null>(null);

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
    setGeneratedMeme(null); // Clear meme when starting a new modification

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

  const handleGenerateMeme = async () => {
    if (!roastText || !costumeData || isGeneratingMeme) return;

    setIsGeneratingMeme(true);
    setMemeError(null);

    try {
      // Shorten roast text for meme format (take first sentence or ~100 chars)
      const shortenedRoast = roastText.split('.')[0] + '.';
      const memeText = shortenedRoast.length > 120
        ? shortenedRoast.substring(0, 120) + '...'
        : shortenedRoast;

      const response = await fetch('/api/generate-meme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: costumeData.dataUrl,
          roastText: memeText,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate meme');
      }

      // Set the generated meme image
      setGeneratedMeme(data.data.image);
    } catch (error) {
      console.error('Error generating meme:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate meme';
      setMemeError(errorMessage);
    } finally {
      setIsGeneratingMeme(false);
    }
  };

  if (!costumeData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Show Halloween loading screen while generating roast
  if (isLoadingAnalysis || isLoadingRoast) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0f] via-[#1a0a1f] to-[#0a0a0f] relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 text-6xl animate-pulse" style={{ animationDuration: '4s' }}>🎃</div>
          <div className="absolute top-40 right-32 text-5xl animate-pulse" style={{ animationDuration: '3s', animationDelay: '1s' }}>🎃</div>
          <div className="absolute bottom-32 left-40 text-7xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }}>🎃</div>
          <div className="absolute bottom-20 right-20 text-6xl animate-pulse" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>🎃</div>
        </div>

        <div className="text-center z-10">
          {/* Rotating Pumpkin */}
          <div className="text-9xl mb-8 animate-spin" style={{ animationDuration: '3s' }}>
            🎃
          </div>

          {/* Loading Text */}
          <div className="space-y-3">
            <h2 className="text-4xl font-bold text-[#FF6B35] animate-pulse">
              {isLoadingAnalysis ? 'Analyzing Your Costume...' : 'Brewing Your Roast...'}
            </h2>
            <p className="text-gray-300 text-xl">
              {isLoadingAnalysis ? 'Detecting spooky details' : 'Crafting the perfect roast'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0f]">
      {/* Top Section - Voice Selection & Roast Player */}
      <div className="bg-[#1a1a1a] border-b border-gray-800 px-8 py-5">
        <div className="max-w-7xl mx-auto flex items-center gap-6">
          {/* Back Button */}
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>

          <div className="w-px h-8 bg-gray-800"></div>

          {/* Voice Selection Dropdown */}
          <div className="flex items-center gap-3">
            <Mic2 className="w-5 h-5 text-gray-400" />
            <label htmlFor="voice-select" className="text-gray-300 text-sm font-medium whitespace-nowrap">
              Voice:
            </label>
            <select
              id="voice-select"
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value as VoiceOption)}
              className="bg-[#2a2a2a] text-white rounded-lg px-4 py-2.5 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-colors"
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
              className="w-11 h-11 bg-[#FF6B35] hover:bg-[#ff8555] disabled:bg-gray-700 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors flex-shrink-0"
            >
              {isLoadingRoast || isLoadingAudio ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : isPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white ml-0.5" />
              )}
            </button>

            <div className="flex-1">
              <div className="w-full bg-[#2a2a2a] rounded-full h-2.5">
                <div
                  className="bg-[#FF6B35] h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${audioProgress}%` }}
                ></div>
              </div>
            </div>

            <div className="text-gray-400 text-sm min-w-[90px] text-right">
              {isLoadingAnalysis ? 'Analyzing...' : isLoadingRoast ? 'Generating...' : isLoadingAudio ? 'Loading...' : isPlaying ? 'Playing...' : 'Ready'}
            </div>
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {(analysisError || roastError || audioError || memeError) && (
        <div className="bg-red-900/20 border-b border-red-800 px-8 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400 text-sm">
              {analysisError || roastError || audioError || memeError}
            </p>
          </div>
        </div>
      )}

      {/* Main Content - 2 Columns */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Half - Original Image */}
        <div className="w-1/2 p-8 border-r border-gray-800 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <Camera className="w-6 h-6 text-[#FF6B35]" />
            <h2 className="text-white text-xl font-semibold">Original Costume</h2>
          </div>

          <div className="flex-1 relative bg-black/50 rounded-xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-colors">
            <Image
              src={costumeData.dataUrl}
              alt="Original costume"
              fill
              className="object-contain p-4"
              priority
            />
          </div>

          {/* Roast Transcript */}
          {roastText && !isLoadingRoast && (
            <div className="bg-[#1a1a1a] rounded-xl p-5 border border-gray-800">
              <div className="flex items-center gap-2.5 mb-3">
                <Flame className="w-5 h-5 text-[#FF6B35]" />
                <h3 className="text-white font-semibold text-base">Roast Transcript</h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                {roastText}
              </p>
            </div>
          )}
        </div>

        {/* Right Half - Modified Image + Input */}
        <div className="w-1/2 flex flex-col">
          {/* Modified Image */}
          <div className="flex-1 p-8 pb-4 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-purple-500" />
              <h2 className="text-white text-xl font-semibold">AI Modified Costume</h2>
            </div>

            <div className="flex-1 relative bg-black/50 rounded-xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-colors">
              {generatedMeme ? (
                <Image
                  src={generatedMeme}
                  alt="Generated meme"
                  fill
                  className="object-contain p-4"
                />
              ) : generatedImage ? (
                <Image
                  src={generatedImage}
                  alt="AI modified costume"
                  fill
                  className="object-contain p-4"
                />
              ) : modificationAnalysis ? (
                <div className="flex items-center justify-center h-full p-8">
                  <div className="text-center max-w-lg">
                    <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                      <Sparkles className="w-12 h-12 text-purple-500" />
                    </div>
                    <p className="text-xl mb-4 text-white font-semibold">Modification Analysis</p>
                    <p className="text-sm leading-relaxed mb-6 text-gray-300">{modificationAnalysis}</p>
                    <p className="text-xs text-gray-500 bg-[#1a1a1a] rounded-lg p-3 border border-gray-800">
                      Note: Visual image generation coming soon
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                      <Sparkles className="w-16 h-16 text-gray-600" />
                    </div>
                    <p className="text-lg mb-2 text-white font-medium">No modifications yet</p>
                    <p className="text-sm text-gray-500">Use the input below to request changes or generate a meme</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Modification Input */}
          <div className="p-8 pt-4">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Describe your modification (e.g., 'add a witch hat')..."
              className="w-full bg-[#1a1a1a] text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-800 placeholder-gray-600 transition-all mb-3"
              disabled={isProcessing}
            />

            {/* Buttons Row */}
            <div className="flex gap-3">
              <button
                onClick={handleSendMessage}
                disabled={isProcessing || !inputMessage.trim()}
                className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-800 disabled:text-gray-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>Modify</span>
                  </>
                )}
              </button>

              {roastText && (
                <button
                  onClick={handleGenerateMeme}
                  disabled={isGeneratingMeme || !roastText}
                  className="flex-1 px-6 py-3 bg-[#FF6B35] hover:bg-[#ff8555] disabled:bg-gray-800 disabled:text-gray-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isGeneratingMeme ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <ImagePlus className="w-5 h-5" />
                      <span>Generate Meme</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
