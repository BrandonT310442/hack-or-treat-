import { NextRequest, NextResponse } from "next/server";
import { getVisionModel, GENERATION_CONFIGS } from "../utils/gemini";
import {
  validateGenerateRoastRequest,
  GenerateRoastResponse,
} from "../utils/validation";
import { loadPrompt, fillPromptTemplate } from "../utils/prompts";

/**
 * POST /api/generate-roast
 * Generates a hilarious roast based on costume analysis
 */
export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();

    // Validate request
    const validation = validateGenerateRoastRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
        } as GenerateRoastResponse,
        { status: 400 }
      );
    }

    const { costumeType, failPoints, analysis } = body;

    // Get Gemini model
    const model = getVisionModel();

    // Load and fill the prompt for roast generation
    const promptTemplate = loadPrompt('generate-roast');
    const prompt = fillPromptTemplate(promptTemplate, {
      costumeType,
      failPoints,
      analysis,
    });

    // Call Gemini API
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
      generationConfig: GENERATION_CONFIGS.ROAST,
    });

    const response = await result.response;
    const roastText = response.text().trim();

    // Return successful response
    return NextResponse.json({
      success: true,
      data: {
        roast: roastText,
      },
    } as GenerateRoastResponse);
  } catch (error) {
    console.error("Error generating roast:", error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return NextResponse.json(
          {
            success: false,
            error: "API configuration error. Please contact support.",
          } as GenerateRoastResponse,
          { status: 500 }
        );
      }

      if (error.message.includes("quota") || error.message.includes("rate limit")) {
        return NextResponse.json(
          {
            success: false,
            error: "Service is busy. Please try again in a moment.",
          } as GenerateRoastResponse,
          { status: 429 }
        );
      }
    }

    // Fallback roast if API fails
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate roast. Please try again.",
      } as GenerateRoastResponse,
      { status: 500 }
    );
  }
}
