import { NextRequest, NextResponse } from "next/server";
import { getVisionModel, GENERATION_CONFIGS } from "../utils/gemini";
import {
  validateGenerateRoastRequest,
  GenerateRoastResponse,
} from "../utils/validation";

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

    // Create the prompt for roast generation
    const prompt = `You are a sarcastic ghost judge combined with a disappointed theater critic. Your job is to roast this Halloween costume attempt.

COSTUME ANALYSIS:
- Attempting to be: ${costumeType}
- Specific failures: ${failPoints.join(", ")}
- Overall assessment: ${analysis}

Generate a HILARIOUS, SAVAGE roast that:
1. Is 2-3 sentences maximum
2. References SPECIFIC failures from the list above
3. Is funny and shareable (not mean-spirited, but brutally honest)
4. Sounds like a disappointed critic mixed with a sarcastic ghost
5. Makes people laugh while roasting the costume quality

Examples of the tone:
- "You came as Dracula but you look like you got dressed in the dark at a Spencer's closing sale."
- "This Harley Quinn costume screams 'I bought everything at Party City yesterday and forgot to remove the price tags.'"
- "I've seen more authentic pirate costumes at a corporate team-building event."

Generate ONLY the roast text, nothing else. Make it specific to THIS costume's failures.`;

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
