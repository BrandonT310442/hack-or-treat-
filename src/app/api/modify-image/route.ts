import { NextRequest, NextResponse } from 'next/server';
import { getImageGenerationModel, GENERATION_CONFIGS } from '../utils/gemini';
import { parseImageData } from '../utils/validation';

export async function POST(request: NextRequest) {
  try {
    const { imageData, prompt, conversationHistory } = await request.json();

    if (!imageData || !prompt) {
      return NextResponse.json(
        { error: 'Missing required fields: imageData and prompt' },
        { status: 400 }
      );
    }

    // Parse the original image data
    const { base64, mimeType } = parseImageData(imageData);

    // Get image generation model (gemini-2.5-flash-image)
    const model = getImageGenerationModel();

    // Create the modification prompt
    const modificationPrompt = `Modify this Halloween costume image based on the following request: ${prompt}

Keep the original costume recognizable but enhance it according to the request.
Make the modifications look natural and maintain the Halloween theme.
Ensure the result is appropriate for all audiences.`;

    // Call Gemini API for image generation (text-and-image-to-image)
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: modificationPrompt,
            },
            {
              inlineData: {
                mimeType: mimeType,
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
    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error('No image generated');
    }

    const imagePart = candidates[0].content.parts.find(
      (part: { inlineData?: { data: string; mimeType: string } }) =>
        part.inlineData
    );

    if (!imagePart || !imagePart.inlineData) {
      throw new Error('No image data in response');
    }

    const generatedImageData = imagePart.inlineData.data;
    const outputMimeType = imagePart.inlineData.mimeType;

    // Return successful response with base64 image
    return NextResponse.json({
      success: true,
      modifiedImageData: `data:${outputMimeType};base64,${generatedImageData}`,
      analysis: `Successfully modified the costume image: ${prompt}`,
      message: 'Image modification complete!',
    });
  } catch (error) {
    console.error('Error modifying image:', error);
    console.error('Full error details:', JSON.stringify(error, null, 2));

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          {
            success: false,
            error: 'API configuration error. Please contact support.',
          },
          { status: 500 }
        );
      }

      if (error.message.includes('quota') || error.message.includes('rate limit')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Service is busy. Please try again in a moment.',
          },
          { status: 429 }
        );
      }

      if (error.message.includes('safety') || error.message.includes('blocked')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Image generation blocked due to content policy. Try a different modification.',
          },
          { status: 400 }
        );
      }

      // Log the specific error for debugging
      console.error('Specific error:', error.message);
    }

    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to modify image. Please try again.',
      },
      { status: 500 }
    );
  }
}
