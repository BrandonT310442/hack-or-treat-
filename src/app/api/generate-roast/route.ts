import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { imageData } = await request.json();

    if (!imageData) {
      return NextResponse.json(
        { error: 'Missing required field: imageData' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Use Gemini Pro Vision for image analysis
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    // Convert base64 image data to the format Gemini expects
    const base64Data = imageData.split(',')[1];
    const mimeType = imageData.split(':')[1].split(';')[0];

    // Create the roast prompt
    const roastPrompt = `You are a witty, playful AI comedian specializing in Halloween costume roasts.
Analyze this Halloween costume image and provide a humorous, light-hearted roast.

Guidelines for the roast:
1. Keep it playful and fun - never mean-spirited or hurtful
2. Be creative and use Halloween-themed humor
3. Point out funny details in the costume (colors, accessories, styling, etc.)
4. Make pop culture references if relevant
5. End with a compliment or encouraging note
6. Keep the roast between 3-5 sentences
7. Use vivid, descriptive language that works well when read aloud
8. Avoid profanity or offensive content

Generate a hilarious but friendly roast of this Halloween costume!`;

    const imageParts = [
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        },
      },
    ];

    const result = await model.generateContent([roastPrompt, ...imageParts]);
    const response = result.response;
    const roastText = response.text();

    return NextResponse.json({
      success: true,
      roast: roastText,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error generating roast:', error);
    return NextResponse.json(
      { error: 'Failed to generate roast' },
      { status: 500 }
    );
  }
}
