import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/generate-audio
 * Generates audio from text using Fish Audio API
 */
export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const { text, format = "mp3", temperature = 0.9, top_p = 0.9, reference_id } = body;

    // Validate input
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Text is required and must be a non-empty string",
        },
        { status: 400 }
      );
    }

    // Get API key from environment
    const apiKey = process.env.FISH_AUDIO_API_KEY;
    if (!apiKey) {
      console.error("FISH_AUDIO_API_KEY not configured");
      return NextResponse.json(
        {
          success: false,
          error: "Audio service not configured",
        },
        { status: 500 }
      );
    }

    // Call Fish Audio API
    const requestBody: any = {
      text: text.trim(),
      format,
      temperature,
      top_p,
    };

    // Add reference_id if provided (for specific voice models)
    if (reference_id) {
      requestBody.reference_id = reference_id;
    }

    const response = await fetch("https://api.fish.audio/v1/tts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    // Handle API errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Fish Audio API error:", response.status, errorText);

      if (response.status === 401) {
        return NextResponse.json(
          {
            success: false,
            error: "Audio service authentication failed",
          },
          { status: 500 }
        );
      }

      if (response.status === 402) {
        return NextResponse.json(
          {
            success: false,
            error: "Audio service quota exceeded",
          },
          { status: 429 }
        );
      }

      if (response.status === 422) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid audio generation parameters",
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: "Failed to generate audio",
        },
        { status: 500 }
      );
    }

    // Get audio data
    const audioBuffer = await response.arrayBuffer();

    // Return audio file
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": `audio/${format}`,
        "Content-Length": audioBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("Error generating audio:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate audio. Please try again.",
      },
      { status: 500 }
    );
  }
}
