'use client';

import { useState, useRef } from 'react';

export default function TestAudioPage() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);

  // Barack Obama voice model ID
  const OBAMA_VOICE_ID = '4ce7e917cedd4bc2bb2e6ff3a46acaa1';

  const handleGenerateAudio = async () => {
    if (!text.trim()) {
      setError('Please enter some text');
      return;
    }

    setLoading(true);
    setError('');

    // Cleanup previous audio URL
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl('');
    }

    try {
      const response = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          reference_id: OBAMA_VOICE_ID,
          format: 'mp3',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate audio');
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

      // Auto-play the audio
      setTimeout(() => {
        audioRef.current?.play();
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Failed to generate audio');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleGenerateAudio();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 text-purple-900">
          🎤 Fish Audio TTS Tester
        </h1>
        <p className="text-center text-gray-700 mb-8">
          Testing with Barack Obama voice
        </p>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter Text to Convert to Speech
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your text here... (Ctrl+Enter to generate)"
            className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-500 mt-2">
            Press Ctrl+Enter or click the button below
          </p>
          <button
            onClick={handleGenerateAudio}
            disabled={loading || !text.trim()}
            className="w-full mt-4 bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold
              hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed
              transition-colors"
          >
            {loading ? 'Generating Audio...' : 'Generate Speech'}
          </button>
        </div>

        {/* Audio Player */}
        {audioUrl && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Generated Audio
            </h2>
            <audio
              ref={audioRef}
              controls
              src={audioUrl}
              className="w-full"
            >
              Your browser does not support the audio element.
            </audio>
            <a
              href={audioUrl}
              download="obama-tts.mp3"
              className="block mt-4 text-center bg-green-600 text-white py-2 px-4 rounded-lg font-semibold
                hover:bg-green-700 transition-colors"
            >
              Download Audio
            </a>
          </div>
        )}

        {/* Example Texts */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            Example Texts to Try:
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => setText("My fellow Americans, tonight I want to talk to you about artificial intelligence and the future of technology.")}
              className="block w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors text-sm"
            >
              Presidential Speech
            </button>
            <button
              onClick={() => setText("Let me be clear: this costume is unacceptable. We can do better, and we must do better.")}
              className="block w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors text-sm"
            >
              Costume Roast
            </button>
            <button
              onClick={() => setText("Change will not come if we wait for some other person or some other time. We are the ones we've been waiting for.")}
              className="block w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors text-sm"
            >
              Inspirational Quote
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Using Fish Audio API with Barack Obama voice</p>
          <p className="mt-2">Voice ID: {OBAMA_VOICE_ID}</p>
        </div>
      </div>
    </div>
  );
}
