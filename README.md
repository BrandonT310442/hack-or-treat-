# Roast Reaper

A fun AI-powered web application that analyzes Halloween costumes and provides humorous roasts with voice narration. Built for Hack-or-Treat 2025.

## Features

- **Image Upload**: Drag-and-drop or browse to upload costume photos
- **AI Roasting**: Get playful, humorous feedback on your costume using Gemini AI
- **Voice Narration**: Listen to your roast with text-to-speech
- **Interactive Modifications**: Chat with AI to modify and enhance your costume
- **Privacy-First**: All processing happens in your browser - no data is stored

## Tech Stack

- **Next.js 16** with App Router
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Google Gemini AI** for image analysis and text generation
- **Web Speech API** for text-to-speech

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hack-or-treat-
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your Gemini API key to `.env.local`:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

5. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Use

1. **Upload Your Costume**: Click "Upload Costume" and select or drag-and-drop a photo of your Halloween costume
2. **Get Roasted**: The AI will automatically analyze your costume and generate a playful roast
3. **Listen to the Roast**: Click the play button in the bottom player to hear your roast with text-to-speech
4. **Modify Your Costume**: Use the chat interface on the right to request modifications (e.g., "add a witch hat", "make it more colorful")
5. **Compare Results**: View your original image and AI-modified versions side-by-side

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── generate-roast/     # API endpoint for generating roasts
│   │   └── modify-image/        # API endpoint for image modifications
│   ├── results/                 # Results page with roast player and chat
│   ├── globals.css             # Global styles and Halloween theme
│   ├── layout.tsx              # Root layout with metadata
│   └── page.tsx                # Homepage with upload interface
├── components/
│   └── ImageUpload.tsx         # Drag-and-drop upload component
├── types/
│   └── upload.ts               # TypeScript type definitions
└── utils/
    └── imageValidation.ts      # Image validation utilities
```

## API Endpoints

### POST /api/generate-roast
Analyzes a costume image and generates a humorous roast.

**Request Body:**
```json
{
  "imageData": "data:image/jpeg;base64,..."
}
```

**Response:**
```json
{
  "success": true,
  "roast": "Your costume roast text here...",
  "timestamp": "2025-10-29T12:00:00.000Z"
}
```

### POST /api/modify-image
Analyzes modification requests and provides guidance on costume changes.

**Request Body:**
```json
{
  "imageData": "data:image/jpeg;base64,...",
  "prompt": "add a witch hat",
  "conversationHistory": [...]
}
```

**Response:**
```json
{
  "success": true,
  "analysis": "I'll add a witch hat to your costume...",
  "message": "Image modification analysis complete"
}
```

## Current Limitations

- **Image Generation**: The chat feature currently provides text analysis of requested modifications. Actual visual image generation would require integration with an image generation API like DALL-E, Stable Diffusion, or Google's Imagen.
- **Voice Options**: Uses the browser's default text-to-speech voice. For better quality, consider integrating ElevenLabs or Google Cloud Text-to-Speech.

## Future Enhancements

- [ ] Integrate image generation API for visual costume modifications
- [ ] Add premium voice options with more personality
- [ ] Implement costume style suggestions
- [ ] Add sharing functionality for roasts
- [ ] Create a gallery of best roasts (with user permission)
- [ ] Add costume rating system
- [ ] Multi-language support

## Privacy & Data

This application is designed with privacy in mind:
- Images are processed client-side and stored only in sessionStorage
- No images are permanently saved to a database
- API calls to Gemini AI are made server-side to protect your API key
- Session data is cleared when you close the browser tab

## Contributing

This is a hackathon project for Hack-or-Treat 2025. Contributions, issues, and feature requests are welcome!

## License

This project is built for educational and entertainment purposes as part of Hack-or-Treat 2025.
