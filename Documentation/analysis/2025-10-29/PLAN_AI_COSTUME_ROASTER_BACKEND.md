# Implementation Plan: AI Costume Roaster Backend

## Context & Motivation

The AI Costume Roaster is a hackathon project that roasts Halloween costumes using AI. The backend needs to securely integrate with Google's Gemini API to:
1. Analyze uploaded costume images and generate witty roasts
2. Generate improved costume images using Imagen

This plan focuses solely on backend API development - creating secure Node.js/Express endpoints that proxy Gemini API calls, keeping API keys safe, and returning structured responses to the frontend.

## Scope

### Included
- Express.js backend server setup with TypeScript
- Three REST API endpoints: `/api/analyze`, `/api/generate-roast`, `/api/generate-costume`
- Gemini API integration for image analysis (vision model)
- Gemini Imagen API integration for costume image generation
- Environment variable configuration for API keys
- Error handling and validation
- Image processing utilities (base64 conversion, format validation)
- CORS configuration for Next.js frontend
- Basic rate limiting

### Excluded
- Frontend components (handled separately)
- TTS voice narration (handled in browser)
- Image storage/database (ephemeral processing only)
- User authentication
- Advanced caching layer
- Deployment configuration

## Technical Approach

**Architecture:** Next.js API routes (serverless functions) instead of standalone Express server
- Leverages existing Next.js setup
- Simplifies deployment
- Built-in CORS handling
- TypeScript already configured

**API Integration Strategy:**
1. Use Google's official `@google/generative-ai` SDK
2. Image analysis: Gemini 2.5 Flash (vision-capable, fast)
3. Image generation: Imagen 4.0 Fast (optimized for speed)
4. Base64 inline data for images (<20MB)

**Security:**
- API keys in `.env.local` (never committed)
- Server-side only API calls
- Input validation for image size/format
- Rate limiting per IP

## Implementation Steps

### Phase 1: Project Setup
1. **Install Dependencies** - Add Gemini SDK and required packages
   - Location: `package.json`
   - Dependencies: `@google/generative-ai`, `dotenv`
   - Validation: `npm install` completes without errors

2. **Configure Environment Variables** - Set up API key management
   - Location: `.env.local`, `.env.example`
   - Dependencies: Gemini API key from Google AI Studio
   - Validation: Environment variables load correctly

3. **Create Backend Directory Structure** - Organize API routes
   - Location: `src/app/api/`
   - Structure:
     ```
     src/app/api/
     ├── analyze/route.ts
     ├── generate-roast/route.ts
     ├── generate-costume/route.ts
     └── utils/
         ├── gemini.ts
         └── validation.ts
     ```
   - Validation: Directory structure matches plan

### Phase 2: Utility Functions
4. **Create Gemini Client Utility** - Initialize SDK client
   - Location: `src/app/api/utils/gemini.ts`
   - Dependencies: Environment variables configured
   - Implementation:
     - Export configured Gemini client instance
     - Handle API key validation
     - Export model instances (vision, generation)
   - Validation: Client initializes without errors

5. **Create Validation Utility** - Input validation functions
   - Location: `src/app/api/utils/validation.ts`
   - Dependencies: None
   - Implementation:
     - Validate image format (JPEG, PNG, WEBP)
     - Validate image size (<20MB)
     - Validate base64 encoding
     - Type definitions for request/response
   - Validation: Unit tests pass (optional for MVP)

### Phase 3: Core API Endpoints
6. **Implement `/api/analyze` Endpoint** - Image analysis
   - Location: `src/app/api/analyze/route.ts`
   - Dependencies: Gemini client, validation utils
   - Implementation:
     ```typescript
     POST /api/analyze
     Request: { image: string (base64) }
     Response: {
       analysis: string,
       costumeType: string,
       failPoints: string[]
     }
     ```
   - Prompt: "Analyze this Halloween costume. Identify: 1) What costume they're attempting, 2) Specific failures (cheap props, wrong colors, poor fit, mismatched pieces). Be specific and brutally honest like a disappointed theater critic. Format as JSON with fields: costumeType, failPoints (array), overallAssessment."
   - Model: `gemini-2.5-flash`
   - Validation: Successfully analyzes test costume image

7. **Implement `/api/generate-roast` Endpoint** - Generate roast text
   - Location: `src/app/api/generate-roast/route.ts`
   - Dependencies: Gemini client, validation utils
   - Implementation:
     ```typescript
     POST /api/generate-roast
     Request: {
       analysis: string,
       costumeType: string,
       failPoints: string[]
     }
     Response: {
       roast: string
     }
     ```
   - Prompt: "Based on this costume analysis: [analysis]. Generate a hilarious, savage 2-3 sentence roast. Channel a sarcastic ghost judge meets disappointed theater critic. Be specific about the failures mentioned. Make it funny and shareable."
   - Model: `gemini-2.5-flash`
   - Temperature: 0.9 (high creativity)
   - Validation: Generates funny, specific roasts

8. **Implement `/api/generate-costume` Endpoint** - Generate improved costume image
   - Location: `src/app/api/generate-costume/route.ts`
   - Dependencies: Gemini client, validation utils
   - Implementation:
     ```typescript
     POST /api/generate-costume
     Request: {
       costumeType: string,
       improvementPrompt?: string
     }
     Response: {
       imageUrl: string (base64 or URL),
       prompt: string
     }
     ```
   - Prompt: "Professional, high-quality [costumeType] Halloween costume. Perfect execution with authentic materials, accurate colors, proper fit, and attention to detail. Studio photography, 4K, dramatic lighting. Show what this costume should actually look like."
   - Model: `imagen-4.0-fast-generate-001`
   - Parameters:
     - `numberOfImages`: 1
     - `imageSize`: "1K"
     - `aspectRatio`: "1:1"
   - Validation: Generates improved costume images

### Phase 4: Error Handling & Polish
9. **Add Comprehensive Error Handling** - Graceful failure
   - Location: All route files
   - Dependencies: All endpoints implemented
   - Implementation:
     - Catch API errors (rate limits, invalid requests)
     - Return user-friendly error messages
     - Log errors for debugging
     - HTTP status codes (400, 500, 429)
   - Validation: Test error scenarios

10. **Add Request Validation Middleware** - Input sanitization
    - Location: All route files
    - Dependencies: Validation utils
    - Implementation:
      - Validate request body structure
      - Sanitize inputs
      - Check required fields
      - Early return on invalid input
    - Validation: Invalid requests rejected with clear errors

11. **Configure Rate Limiting** - Prevent abuse
    - Location: API route wrappers or middleware
    - Dependencies: None (Next.js built-in or simple implementation)
    - Implementation:
      - Simple IP-based rate limiting (10 requests/minute per IP)
      - Return 429 status when exceeded
    - Validation: Rate limit enforces correctly

### Phase 5: Testing & Documentation
12. **Create Test Data & Manual Testing** - Verify all endpoints
    - Location: `test-images/` directory (optional)
    - Dependencies: All endpoints complete
    - Implementation:
      - Test with sample costume images
      - Verify full flow: analyze → roast → generate
      - Test error cases
      - Document any issues
    - Validation: All endpoints work end-to-end

13. **Create API Documentation** - Usage guide for frontend
    - Location: `Documentation/API.md`
    - Dependencies: All endpoints finalized
    - Implementation:
      - Document each endpoint (method, path, request/response)
      - Include example requests/responses
      - List error codes and meanings
      - Add setup instructions
    - Validation: Documentation is clear and complete

## API Endpoints Specification

### POST `/api/analyze`
**Purpose:** Analyze costume image and identify failures

**Request:**
```json
{
  "image": "base64_encoded_image_string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "costumeType": "Dracula",
    "failPoints": [
      "Cheap plastic fangs visible",
      "Cape is wrinkled Halloween store quality",
      "Regular jeans instead of period-appropriate pants"
    ],
    "overallAssessment": "Attempting a classic Dracula but executed with bargain bin materials and modern clothing"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Image too large (max 20MB)"
}
```

### POST `/api/generate-roast`
**Purpose:** Generate witty roast based on analysis

**Request:**
```json
{
  "costumeType": "Dracula",
  "failPoints": ["Cheap plastic fangs", "Wrinkled cape", "Wearing jeans"],
  "analysis": "Attempting Dracula with bargain materials"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "roast": "You came as Dracula but somehow managed to look less intimidating than a Spirit Halloween clearance rack. Those plastic fangs and wrinkled cape paired with jeans scream 'I forgot it was Halloween until this morning.'"
  }
}
```

### POST `/api/generate-costume`
**Purpose:** Generate improved costume image

**Request:**
```json
{
  "costumeType": "Dracula",
  "improvementPrompt": "Professional vampire costume with high-quality materials"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "image": "base64_encoded_generated_image",
    "prompt": "Professional, high-quality Dracula Halloween costume..."
  }
}
```

## Environment Variables

Required in `.env.local`:
```bash
GEMINI_API_KEY=your_api_key_here
```

Optional:
```bash
RATE_LIMIT_MAX=10
RATE_LIMIT_WINDOW_MS=60000
MAX_IMAGE_SIZE_MB=20
```

## Dependencies to Install

```json
{
  "dependencies": {
    "@google/generative-ai": "^0.21.0"
  }
}
```

## Success Criteria

✅ All three endpoints functional and tested
✅ Roasts are specific, funny, and shareable
✅ Generated images show clear improvement over original
✅ Error handling prevents crashes and provides clear messages
✅ Response times under 10 seconds per request
✅ API keys secured and never exposed to client
✅ Documentation complete for frontend integration
