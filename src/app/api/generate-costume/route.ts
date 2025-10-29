import { NextRequest, NextResponse } from "next/server";
import { getImageGenerationModel, GENERATION_CONFIGS } from "../utils/gemini";
import {
  validateGenerateCostumeRequest,
  GenerateCostumeResponse,
  parseImageData,
} from "../utils/validation";
import { loadPrompt, fillPromptTemplate } from "../utils/prompts";

/**
 * POST /api/generate-costume
 * Generates an improved version of the costume using Imagen
 */
export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();

    // Validate request
    const validation = validateGenerateCostumeRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
        } as GenerateCostumeResponse,
        { status: 400 }
      );
    }

    const { image, costumeType, improvementPrompt } = body;

    // Parse the original costume image
    const { base64, mimeType: inputMimeType } = parseImageData(image);

    // Get image generation model
    const model = getImageGenerationModel();

    // Load and fill the prompt for costume generation
    const promptTemplate = loadPrompt('generate-costume');
    const basePrompt = improvementPrompt || fillPromptTemplate(promptTemplate, {
      costumeType,
    });

    // Call Gemini API for image generation (text-and-image-to-image)
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: basePrompt,
            },
            {
              inlineData: {
                mimeType: inputMimeType,
                data: base64,
              },
            },
          ],
        },
      ],
      generationConfig: GENERATION_CONFIGS.IMAGE,
    });

    const response = await result.response;

    // Extract image data from response
    // Imagen returns image in the candidates[0].content.parts[0].inlineData
    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("No image generated");
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

    // Return successful response with base64 image
    return NextResponse.json({
      success: true,
      data: {
        image: `data:${outputMimeType};base64,${imageData}`,
        prompt: basePrompt,
      },
    } as GenerateCostumeResponse);
  } catch (error) {
    console.error("Error generating costume image:", error);
    console.error("Full error details:", JSON.stringify(error, null, 2));

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return NextResponse.json(
          {
            success: false,
            error: "API configuration error. Please contact support.",
          } as GenerateCostumeResponse,
          { status: 500 }
        );
      }

      if (error.message.includes("quota") || error.message.includes("rate limit")) {
        return NextResponse.json(
          {
            success: false,
            error: "Service is busy. Please try again in a moment.",
          } as GenerateCostumeResponse,
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
              "Image generation blocked due to content policy. Try a different costume type.",
          } as GenerateCostumeResponse,
          { status: 400 }
        );
      }

      // Log the specific error for debugging
      console.error("Specific error:", error.message);
    }

    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate costume image. Please try again.",
      } as GenerateCostumeResponse,
      { status: 500 }
    );
  }
}
