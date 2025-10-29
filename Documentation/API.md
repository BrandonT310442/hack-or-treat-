# AI Costume Roaster - Backend API Documentation

## Overview

The AI Costume Roaster backend provides three REST API endpoints for analyzing Halloween costumes, generating roasts, and creating improved costume images using Google's Gemini API.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Gemini API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Get your API key from: https://ai.google.dev/

### 3. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3000/api`

## API Endpoints

### 1. POST `/api/analyze`

Analyzes a costume image and identifies what costume the person is attempting and specific failure points.

**Request:**

```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..." // or raw base64
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "costumeType": "Dracula",
    "failPoints": [
      "Cheap plastic fangs visible",
      "Cape is wrinkled Halloween store quality",
      "Regular jeans instead of period-appropriate pants",
      "Missing formal vest and shirt"
    ],
    "overallAssessment": "Attempting a classic Dracula but executed with bargain bin materials and modern clothing that completely breaks the illusion."
  }
}
```

**Response (Error - 400/500):**

```json
{
  "success": false,
  "error": "Image too large. Max size: 20MB"
}
```

**Error Codes:**
- `400`: Invalid request (missing/invalid image, wrong format, too large)
- `429`: Rate limit exceeded
- `500`: Server error or API failure

---

### 2. POST `/api/generate-roast`

Generates a hilarious roast based on the costume analysis.

**Request:**

```json
{
  "costumeType": "Dracula",
  "failPoints": [
    "Cheap plastic fangs",
    "Wrinkled cape",
    "Wearing jeans"
  ],
  "analysis": "Attempting Dracula with bargain materials"
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "roast": "You came as Dracula but somehow managed to look less intimidating than a Spirit Halloween clearance rack. Those plastic fangs and wrinkled cape paired with jeans scream 'I forgot it was Halloween until this morning.'"
  }
}
```

**Response (Error - 400/500):**

```json
{
  "success": false,
  "error": "costumeType is required"
}
```

**Error Codes:**
- `400`: Invalid request (missing required fields)
- `429`: Rate limit exceeded
- `500`: Server error or API failure

---

### 3. POST `/api/generate-costume`

Generates an improved version of the costume using AI image generation (Imagen).

**Request:**

```json
{
  "costumeType": "Dracula",
  "improvementPrompt": "Professional vampire costume with high-quality materials" // optional
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "prompt": "Professional, high-quality Dracula Halloween costume. Perfect execution with authentic materials..."
  }
}
```

**Response (Error - 400/500):**

```json
{
  "success": false,
  "error": "Failed to generate costume image. Please try again."
}
```

**Error Codes:**
- `400`: Invalid request or content policy violation
- `429`: Rate limit exceeded
- `500`: Server error or API failure

---

## Image Format Requirements

### Supported Formats:
- JPEG (`.jpg`, `.jpeg`)
- PNG (`.png`)
- WebP (`.webp`)

### Size Limits:
- Maximum file size: **20MB** (configurable via `MAX_IMAGE_SIZE_MB` env variable)
- Recommended: Compress images before upload for faster processing

### Image Encoding:
Images can be sent as:
1. **Data URL**: `data:image/jpeg;base64,/9j/4AAQ...`
2. **Raw base64**: `/9j/4AAQ...` (auto-detected MIME type)

## Example Usage

### JavaScript/TypeScript Example

```typescript
// 1. Analyze costume
const analyzeResponse = await fetch('http://localhost:3000/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    image: base64ImageData // or data URL
  })
});
const analysis = await analyzeResponse.json();

// 2. Generate roast
const roastResponse = await fetch('http://localhost:3000/api/generate-roast', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    costumeType: analysis.data.costumeType,
    failPoints: analysis.data.failPoints,
    analysis: analysis.data.overallAssessment
  })
});
const roast = await roastResponse.json();

// 3. Generate improved costume
const costumeResponse = await fetch('http://localhost:3000/api/generate-costume', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    costumeType: analysis.data.costumeType
  })
});
const improvedCostume = await costumeResponse.json();
```

### cURL Example

```bash
# Analyze costume
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
  }'

# Generate roast
curl -X POST http://localhost:3000/api/generate-roast \
  -H "Content-Type: application/json" \
  -d '{
    "costumeType": "Dracula",
    "failPoints": ["Cheap fangs", "Wrinkled cape"],
    "analysis": "Bargain bin Dracula"
  }'

# Generate improved costume
curl -X POST http://localhost:3000/api/generate-costume \
  -H "Content-Type: application/json" \
  -d '{
    "costumeType": "Dracula"
  }'
```

## Error Handling

All endpoints return a consistent error format:

```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

### Common Error Messages:

| Error Message | Meaning | Solution |
|---------------|---------|----------|
| `Image is required` | No image provided | Include base64 image in request |
| `Image too large (max 20MB)` | Image exceeds size limit | Compress image before upload |
| `Image format not supported` | Unsupported image format | Use JPEG, PNG, or WebP |
| `API configuration error` | Missing API key | Check `.env.local` file |
| `Service is busy` | Rate limit hit | Wait and retry |
| `costumeType is required` | Missing required field | Include all required fields |

## Rate Limiting

Default rate limits:
- **10 requests per minute** per IP address
- Configurable via `RATE_LIMIT_MAX` and `RATE_LIMIT_WINDOW_MS` environment variables

When rate limited, endpoints return `429 Too Many Requests`.

## Models Used

- **Analysis & Roast**: `gemini-2.0-flash-exp` (vision + text generation)
- **Image Generation**: `imagen-3.0-generate-001` (text-to-image)

## Development Tips

### Testing Endpoints

1. Use a tool like [Postman](https://www.postman.com/) or [Insomnia](https://insomnia.rest/)
2. Test with sample costume images from the web
3. Monitor console logs for detailed error messages

### Converting Images to Base64

JavaScript:
```javascript
// From file input
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

// Usage
const file = document.getElementById('fileInput').files[0];
const base64 = await fileToBase64(file);
```

Command line (macOS/Linux):
```bash
base64 -i costume.jpg | pbcopy  # Copies to clipboard
```

### Debugging

Enable detailed logging:
```typescript
// In route files, uncomment console.error statements
console.error("Error details:", error);
```

Check Next.js dev server logs for API errors.

## Security Notes

⚠️ **Important Security Considerations:**

1. **API Key**: Never commit `.env.local` to version control
2. **CORS**: Configure CORS appropriately for production
3. **Rate Limiting**: Implement robust rate limiting for production
4. **Input Validation**: All inputs are validated, but additional sanitization may be needed
5. **File Size**: Enforce strict size limits to prevent DoS attacks

## Production Deployment

### Environment Variables (Production)

Set these in your hosting platform (Vercel, Netlify, etc.):

```bash
GEMINI_API_KEY=your_production_api_key
MAX_IMAGE_SIZE_MB=20
RATE_LIMIT_MAX=10
RATE_LIMIT_WINDOW_MS=60000
```

### Recommended Hosting

- **Vercel**: Automatic deployment from GitHub
- **Netlify**: Supports Next.js with edge functions
- **AWS Lambda**: Serverless deployment

### Performance Optimization

1. **Image Compression**: Implement client-side compression before upload
2. **Caching**: Consider caching results by image hash
3. **CDN**: Use CDN for static assets
4. **Monitoring**: Set up error tracking (Sentry, LogRocket)

## Support

For issues or questions:
1. Check console logs for detailed error messages
2. Review this documentation
3. Check Gemini API status: https://status.cloud.google.com/

## License

See main project LICENSE file.
