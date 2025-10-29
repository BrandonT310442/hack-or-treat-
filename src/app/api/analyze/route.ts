import { NextRequest, NextResponse } from "next/server";
import { getVisionModel, GENERATION_CONFIGS } from "../utils/gemini";
import {
  validateAnalyzeRequest,
  parseImageData,
  AnalyzeResponse,
} from "../utils/validation";
import { loadPrompt } from "../utils/prompts";

/**
 * POST /api/analyze
 * Analyzes a costume image and identifies what costume they're attempting
 * and specific failure points
 */
export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();

    // Validate request
    const validation = validateAnalyzeRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
        } as AnalyzeResponse,
        { status: 400 }
      );
    }

    const { image } = body;

    // Parse image data
    const { base64, mimeType } = parseImageData(image);

    // Get Gemini vision model
    const model = getVisionModel();

    // Load the prompt for costume analysis
    const prompt = loadPrompt('analyze-costume');

    // Call Gemini API with image and prompt
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: GENERATION_CONFIGS.ANALYSIS,
    });

    const response = await result.response;
    const text = response.text();

    // Parse JSON response from Gemini
    let analysisData;
    try {
      // Try to extract JSON from response (Gemini sometimes wraps in markdown)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0]);
      } else {
        analysisData = JSON.parse(text);
      }
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", text);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to parse costume analysis. Please try again.",
        } as AnalyzeResponse,
        { status: 500 }
      );
    }

    // Return successful response
    return NextResponse.json({
      success: true,
      data: {
        costumeType: analysisData.costumeType || "Unknown Costume",
        failPoints: analysisData.failPoints || [],
        overallAssessment:
          analysisData.overallAssessment || "Costume needs improvement.",
      },
    } as AnalyzeResponse);
  } catch (error) {
    console.error("Error analyzing costume:", error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return NextResponse.json(
          {
            success: false,
            error: "API configuration error. Please contact support.",
          } as AnalyzeResponse,
          { status: 500 }
        );
      }

      if (error.message.includes("quota") || error.message.includes("rate limit")) {
        return NextResponse.json(
          {
            success: false,
            error: "Service is busy. Please try again in a moment.",
          } as AnalyzeResponse,
          { status: 429 }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error: "Failed to analyze costume. Please try again.",
      } as AnalyzeResponse,
      { status: 500 }
    );
  }
}
