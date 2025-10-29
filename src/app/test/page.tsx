'use client';

import { useState } from 'react';

export default function TestPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'upload' | 'analyze' | 'roast' | 'generate'>('upload');

  // Results
  const [analysis, setAnalysis] = useState<any>(null);
  const [roast, setRoast] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  // Step 1: Analyze costume
  const handleAnalyze = async () => {
    if (!imageFile) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError('');
    setStep('analyze');

    try {
      const base64 = await fileToBase64(imageFile);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      setAnalysis(data.data);
      setStep('roast');
    } catch (err: any) {
      setError(err.message || 'Failed to analyze image');
      setStep('upload');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Generate roast
  const handleGenerateRoast = async () => {
    if (!analysis) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/generate-roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          costumeType: analysis.costumeType,
          failPoints: analysis.failPoints,
          analysis: analysis.overallAssessment,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Roast generation failed');
      }

      setRoast(data.data.roast);
      setStep('generate');
    } catch (err: any) {
      setError(err.message || 'Failed to generate roast');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Generate improved costume
  const handleGenerateCostume = async () => {
    if (!analysis || !imageFile) return;

    setLoading(true);
    setError('');

    try {
      const base64 = await fileToBase64(imageFile);

      const response = await fetch('/api/generate-costume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64,
          costumeType: analysis.costumeType,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Image generation failed');
      }

      setGeneratedImage(data.data.image);
    } catch (err: any) {
      setError(err.message || 'Failed to generate costume image');
    } finally {
      setLoading(false);
    }
  };

  // Reset everything
  const handleReset = () => {
    setImageFile(null);
    setImagePreview('');
    setAnalysis(null);
    setRoast('');
    setGeneratedImage('');
    setError('');
    setStep('upload');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-100 to-purple-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 text-purple-900">
          🎃 AI Costume Roaster - API Tester
        </h1>
        <p className="text-center text-gray-700 mb-8">
          Test the backend API endpoints
        </p>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Step 1: Upload Image */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            1. Upload Costume Image
          </h2>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="mb-4 block w-full text-sm text-gray-700
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-purple-50 file:text-purple-700
              hover:file:bg-purple-100"
          />
          {imagePreview && (
            <div className="mb-4">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-w-md mx-auto rounded-lg shadow"
              />
            </div>
          )}
          <button
            onClick={handleAnalyze}
            disabled={!imageFile || loading}
            className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold
              hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed
              transition-colors"
          >
            {loading && step === 'analyze' ? 'Analyzing...' : 'Analyze Costume'}
          </button>
        </div>

        {/* Step 2: Analysis Results */}
        {analysis && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              2. Analysis Results
            </h2>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">Costume Type:</p>
              <p className="text-xl font-semibold text-purple-700">
                {analysis.costumeType}
              </p>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Fail Points:</p>
              <ul className="list-disc list-inside space-y-1">
                {analysis.failPoints.map((point: string, idx: number) => (
                  <li key={idx} className="text-gray-700">{point}</li>
                ))}
              </ul>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">Overall Assessment:</p>
              <p className="text-gray-700 italic">{analysis.overallAssessment}</p>
            </div>
            <button
              onClick={handleGenerateRoast}
              disabled={loading}
              className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg font-semibold
                hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed
                transition-colors"
            >
              {loading && step === 'roast' ? 'Generating Roast...' : 'Generate Roast'}
            </button>
          </div>
        )}

        {/* Step 3: Roast */}
        {roast && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              3. The Roast 🔥
            </h2>
            <blockquote className="text-lg italic text-gray-800 border-l-4 border-orange-500 pl-4 mb-4">
              "{roast}"
            </blockquote>
            <button
              onClick={handleGenerateCostume}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold
                hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed
                transition-colors"
            >
              {loading && step === 'generate' ? 'Generating Image...' : 'Generate Improved Costume'}
            </button>
          </div>
        )}

        {/* Step 4: Generated Costume */}
        {generatedImage && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              4. What It Should Look Like ✨
            </h2>
            <img
              src={generatedImage}
              alt="Generated costume"
              className="max-w-md mx-auto rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* Reset Button */}
        {(analysis || roast || generatedImage) && (
          <button
            onClick={handleReset}
            className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold
              hover:bg-gray-700 transition-colors"
          >
            Start Over
          </button>
        )}

        {/* API Status */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Testing endpoints:</p>
          <ul className="space-y-1 mt-2">
            <li className={analysis ? 'text-green-600' : 'text-gray-500'}>
              {analysis ? '✓' : '○'} POST /api/analyze
            </li>
            <li className={roast ? 'text-green-600' : 'text-gray-500'}>
              {roast ? '✓' : '○'} POST /api/generate-roast
            </li>
            <li className={generatedImage ? 'text-green-600' : 'text-gray-500'}>
              {generatedImage ? '✓' : '○'} POST /api/generate-costume
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
