# Backend Setup Guide

## Quick Start

### 1. Get Your Gemini API Key

1. Go to [Google AI Studio](https://ai.google.dev/)
2. Sign in with your Google account
3. Click "Get API Key"
4. Create a new API key or use an existing one

### 2. Configure Environment

```bash
# Copy the example env file
cp .env.example .env.local

# Edit .env.local and add your API key
# GEMINI_API_KEY=your_actual_api_key_here
```

**Important:** Never commit `.env.local` to version control! It's already in `.gitignore`.

### 3. Install Dependencies (Already Done)

Dependencies are already installed, but if needed:
```bash
npm install
```

### 4. Start the Development Server

```bash
npm run dev
```

The backend API will be available at `http://localhost:3000/api`

## Testing the API

### Option 1: Using cURL

```bash
# Test with a sample base64 image (you'll need a real base64 string)
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"image": "YOUR_BASE64_IMAGE_HERE"}'
```

### Option 2: Using Postman/Insomnia

1. Create a new POST request
2. URL: `http://localhost:3000/api/analyze`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "image": "data:image/jpeg;base64,YOUR_BASE64_STRING"
}
```

### Option 3: Using JavaScript

```javascript
// Convert image file to base64
const fileToBase64 = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
};

// Test the API
async function testAPI() {
  // Get image from file input
  const fileInput = document.querySelector('input[type="file"]');
  const file = fileInput.files[0];
  const base64 = await fileToBase64(file);

  // Call analyze endpoint
  const response = await fetch('http://localhost:3000/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64 })
  });

  const result = await response.json();
  console.log(result);
}
```

## API Endpoints Summary

### 1. `/api/analyze` - Analyze costume image
- **Input:** Base64 encoded image
- **Output:** Costume type, fail points, assessment

### 2. `/api/generate-roast` - Generate roast
- **Input:** Costume type, fail points, analysis
- **Output:** Hilarious roast text

### 3. `/api/generate-costume` - Generate improved costume image
- **Input:** Costume type, optional improvement prompt
- **Output:** AI-generated improved costume image (base64)

## Project Structure

```
src/app/api/
├── analyze/
│   └── route.ts          # Costume analysis endpoint
├── generate-roast/
│   └── route.ts          # Roast generation endpoint
├── generate-costume/
│   └── route.ts          # Image generation endpoint
└── utils/
    ├── gemini.ts         # Gemini API client configuration
    └── validation.ts     # Request validation and types
```

## Troubleshooting

### Error: "GEMINI_API_KEY is not set"
**Solution:** Make sure you've created `.env.local` and added your API key:
```bash
echo "GEMINI_API_KEY=your_key_here" > .env.local
```

### Error: "Image too large"
**Solution:** Compress your image before uploading. Max size is 20MB.

### Error: "Service is busy"
**Solution:** You've hit the rate limit. Wait a minute and try again.

### Error: "API key invalid"
**Solution:**
1. Check your API key in `.env.local`
2. Make sure there are no extra spaces
3. Verify the key is active in Google AI Studio

### Port 3000 already in use
**Solution:**
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

## Development Tips

### View Console Logs
All API errors are logged to the console where you ran `npm run dev`. Check there first when debugging.

### Test with Sample Images
1. Find Halloween costume images online
2. Convert to base64 using an online tool
3. Test with different costume types (good, bad, unclear)

### Rate Limiting
Default: 10 requests per minute per IP. Adjust in `.env.local`:
```bash
RATE_LIMIT_MAX=20
RATE_LIMIT_WINDOW_MS=60000
```

## Next Steps

1. ✅ Backend is ready!
2. Frontend can now call these endpoints
3. Integrate with camera/upload functionality
4. Add TTS voice narration in frontend
5. Build the UI components

## Full Documentation

See `Documentation/API.md` for complete API documentation with examples, error codes, and advanced usage.

## Need Help?

1. Check the console logs where `npm run dev` is running
2. Review `Documentation/API.md`
3. Test with cURL or Postman first
4. Verify your API key is valid

Happy hacking! 🎃👻
