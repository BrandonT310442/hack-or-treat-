// Type definitions for API requests and responses

export interface AnalyzeRequest {
  image: string; // base64 encoded image
}

export interface AnalyzeResponse {
  success: boolean;
  data?: {
    costumeType: string;
    failPoints: string[];
    overallAssessment: string;
  };
  error?: string;
}

export interface GenerateRoastRequest {
  costumeType: string;
  failPoints: string[];
  analysis: string;
}

export interface GenerateRoastResponse {
  success: boolean;
  data?: {
    roast: string;
  };
  error?: string;
}

export interface GenerateCostumeRequest {
  image: string; // base64 encoded original costume image
  costumeType: string;
  improvementPrompt?: string;
}

export interface GenerateCostumeResponse {
  success: boolean;
  data?: {
    image: string; // base64 encoded
    prompt: string;
  };
  error?: string;
}

export interface GenerateMemeRequest {
  image?: string; // Optional - not used for generation, only for validation
  roastText: string;
}

export interface GenerateMemeResponse {
  success: boolean;
  data?: {
    image: string; // base64 encoded meme image
  };
  error?: string;
}

// Constants
const MAX_IMAGE_SIZE_MB = Number(process.env.MAX_IMAGE_SIZE_MB) || 20;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

const ALLOWED_IMAGE_FORMATS = ["image/jpeg", "image/png", "image/webp"];

// Validation functions

/**
 * Validates base64 image string
 */
export const validateBase64Image = (base64String: string): {
  valid: boolean;
  error?: string;
  mimeType?: string;
} => {
  if (!base64String || typeof base64String !== "string") {
    return { valid: false, error: "Image data is required" };
  }

  // Check if it's a data URL or raw base64
  let base64Data = base64String;
  let mimeType = "";

  if (base64String.startsWith("data:")) {
    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return { valid: false, error: "Invalid base64 image format" };
    }
    mimeType = matches[1];
    base64Data = matches[2];
  } else {
    // Try to detect MIME type from base64 header
    mimeType = detectMimeType(base64Data);
  }

  // Validate MIME type
  if (!ALLOWED_IMAGE_FORMATS.includes(mimeType)) {
    return {
      valid: false,
      error: `Image format not supported. Allowed: ${ALLOWED_IMAGE_FORMATS.join(", ")}`,
    };
  }

  // Validate base64 format
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  if (!base64Regex.test(base64Data)) {
    return { valid: false, error: "Invalid base64 encoding" };
  }

  // Check file size
  const sizeInBytes = (base64Data.length * 3) / 4;
  if (sizeInBytes > MAX_IMAGE_SIZE_BYTES) {
    return {
      valid: false,
      error: `Image too large. Max size: ${MAX_IMAGE_SIZE_MB}MB`,
    };
  }

  return { valid: true, mimeType };
};

/**
 * Detects MIME type from base64 header
 */
const detectMimeType = (base64: string): string => {
  const signatures: { [key: string]: string } = {
    "/9j/": "image/jpeg",
    iVBORw: "image/png",
    UklGR: "image/webp",
  };

  for (const [signature, mimeType] of Object.entries(signatures)) {
    if (base64.startsWith(signature)) {
      return mimeType;
    }
  }

  return "";
};

/**
 * Extracts base64 data and MIME type from data URL or raw base64
 */
export const parseImageData = (
  imageString: string
): { base64: string; mimeType: string } => {
  if (imageString.startsWith("data:")) {
    const matches = imageString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      return {
        mimeType: matches[1],
        base64: matches[2],
      };
    }
  }

  // Raw base64, detect MIME type
  const mimeType = detectMimeType(imageString);
  return {
    mimeType: mimeType || "image/jpeg", // Default to JPEG
    base64: imageString,
  };
};

/**
 * Validates analyze request body
 */
export const validateAnalyzeRequest = (
  body: unknown
): { valid: boolean; error?: string } => {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body is required" };
  }

  const { image } = body as AnalyzeRequest;

  if (!image) {
    return { valid: false, error: "Image is required" };
  }

  return validateBase64Image(image);
};

/**
 * Validates generate roast request body
 */
export const validateGenerateRoastRequest = (
  body: unknown
): { valid: boolean; error?: string } => {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body is required" };
  }

  const { costumeType, failPoints, analysis } =
    body as GenerateRoastRequest;

  if (!costumeType || typeof costumeType !== "string") {
    return { valid: false, error: "costumeType is required" };
  }

  if (!failPoints || !Array.isArray(failPoints)) {
    return { valid: false, error: "failPoints must be an array" };
  }

  if (!analysis || typeof analysis !== "string") {
    return { valid: false, error: "analysis is required" };
  }

  return { valid: true };
};

/**
 * Validates generate costume request body
 */
export const validateGenerateCostumeRequest = (
  body: unknown
): { valid: boolean; error?: string } => {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body is required" };
  }

  const { image, costumeType } = body as GenerateCostumeRequest;

  if (!image || typeof image !== "string") {
    return { valid: false, error: "image is required" };
  }

  if (!costumeType || typeof costumeType !== "string") {
    return { valid: false, error: "costumeType is required" };
  }

  // Validate the image
  const imageValidation = validateBase64Image(image);
  if (!imageValidation.valid) {
    return imageValidation;
  }

  return { valid: true };
};

/**
 * Validates generate meme request body
 */
export const validateGenerateMemeRequest = (
  body: unknown
): { valid: boolean; error?: string } => {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body is required" };
  }

  const { roastText } = body as GenerateMemeRequest;

  if (!roastText || typeof roastText !== "string") {
    return { valid: false, error: "roastText is required" };
  }

  if (roastText.trim().length === 0) {
    return { valid: false, error: "roastText cannot be empty" };
  }

  return { valid: true };
};
