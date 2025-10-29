import { NextRequest, NextResponse } from "next/server";
import { getImageGenerationModel, GENERATION_CONFIGS } from "../utils/gemini";
import {
  validateGenerateMemeRequest,
  GenerateMemeResponse,
  parseImageData,
} from "../utils/validation";
import { loadPrompt, fillPromptTemplate } from "../utils/prompts";

/**
 * POST /api/generate-meme
 * Generates a shareable meme image with roast text overlaid on the costume
 */
export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();

    // Validate request
    const validation = validateGenerateMemeRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
        } as GenerateMemeResponse,
        { status: 400 }
      );
    }

    const { roastText } = body;

    // Get image generation model
    const model = getImageGenerationModel();

    // Load and fill the prompt for meme generation
    const promptTemplate = loadPrompt('generate-meme');
    const prompt = fillPromptTemplate(promptTemplate, {
      roastText,
    });

    // Call Gemini API for image generation (text-to-image)
    // Generate a completely new meme image from scratch, not based on costume photo
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: GENERATION_CONFIGS.IMAGE,
    });

    const response = await result.response;

    // Extract image data from response
    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("No meme generated");
    }

    const imagePart = candidates[0].content.parts.find(
      (part: { inlineData?: { data: string; mimeType: string } }) =>
        part.inlineData
    );

    if (!imagePart || !imagePart.inlineData) {
      throw new Error("No image data in response");
    }

    const imageData = imagePart.inlineData.data;
    const outputMimeType = imagePart.inlineData.mimeType;

    // Return successful response with base64 meme image
    return NextResponse.json({
      success: true,
      data: {
        image: `data:${outputMimeType};base64,${imageData}`,
      },
    } as GenerateMemeResponse);
  } catch (error) {
    console.error("Error generating meme:", error);
    console.error("Full error details:", JSON.stringify(error, null, 2));

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return NextResponse.json(
          {
            success: false,
            error: "API configuration error. Please contact support.",
          } as GenerateMemeResponse,
          { status: 500 }
        );
      }

      if (error.message.includes("quota") || error.message.includes("rate limit")) {
        return NextResponse.json(
          {
            success: false,
            error: "Service is busy. Please try again in a moment.",
          } as GenerateMemeResponse,
          { status: 429 }
        );
      }

      if (
        error.message.includes("safety") ||
        error.message.includes("blocked")
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Meme generation blocked due to content policy. Try again with different content.",
          } as GenerateMemeResponse,
          { status: 400 }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate meme. Please try again.",
      } as GenerateMemeResponse,
      { status: 500 }
    );
  }
}
