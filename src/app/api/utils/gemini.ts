import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API client
const getApiKey = (): string => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set in environment variables. " +
      "Please create a .env.local file with your API key."
    );
  }

  return apiKey;
};

// Initialize Google Generative AI client
export const genAI = new GoogleGenerativeAI(getApiKey());

// Model configurations
export const MODELS = {
  // Vision model for image analysis and roast generation
  VISION: "gemini-2.0-flash-exp",

  // Image generation model (Imagen)
  IMAGE_GENERATION: "imagen-3.0-generate-001",
} as const;

// Get vision model instance
export const getVisionModel = () => {
  return genAI.getGenerativeModel({
    model: MODELS.VISION,
  });
};

// Get image generation model instance
export const getImageGenerationModel = () => {
  return genAI.getGenerativeModel({
    model: MODELS.IMAGE_GENERATION,
  });
};

// Generation configs
export const GENERATION_CONFIGS = {
  ROAST: {
    temperature: 0.9, // High creativity for funny roasts
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 300,
  },
  ANALYSIS: {
    temperature: 0.4, // More factual for analysis
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 500,
  },
  IMAGE: {
    temperature: 0.7,
    topP: 0.95,
  },
} as const;
