# Implementation Plan: Meme Generation from Roast

## Context & Motivation

Users want the ability to generate shareable memes based on the AI-generated roast of their costume. This feature will:
- Make the roast content more shareable on social media
- Add viral potential to the application
- Provide a fun visual artifact users can save and share
- Transform the text roast into an engaging image format

The meme generation button should be placed in the "AI Modified Costume" section (right panel) below the modification input, as indicated by the user's screenshot. This placement makes sense because:
1. It's related to generated content (like modifications)
2. It keeps the left panel focused on the original costume and roast transcript
3. It provides a natural flow: view roast → listen to roast → generate meme

## Scope

### Included
- Add "Generate Meme" button in the AI Modified Costume section
- Create new `/api/generate-meme` endpoint that uses Gemini's image generation
- Generate a meme image with the roast text overlaid on the costume image
- Display the generated meme in place of the "No modifications yet" placeholder
- Loading states during meme generation
- Error handling for failed meme generation
- Add meme-related state management to results page

### Excluded
- Meme template customization (fixed format for MVP)
- Multiple meme format options (use single style)
- Meme editing capabilities
- Download/share functionality (can be added later)
- Meme history or gallery
- Custom text input for meme (uses roast text only)

## Technical Approach

We'll leverage the existing Gemini image generation infrastructure:
1. Use the same image generation model (`gemini-2.5-flash-image`) already configured
2. Create a new API endpoint that takes the roast text and original image
3. Generate a meme-style image using Gemini's text-and-image-to-image capabilities
4. Add UI state management for meme generation
5. Display the meme in the same area as modified images

The implementation follows existing patterns:
- Similar API structure to `/api/generate-costume`
- State management pattern from roast generation
- UI components consistent with existing design system

## Implementation Steps

### Phase 1: Backend API Endpoint

1. **Create `/api/generate-meme` endpoint** - New API route for meme generation
   - Location: `src/app/api/generate-meme/route.ts`
   - Dependencies: Gemini API setup, validation utilities
   - Validation: Can call endpoint and receive response structure

   Implementation details:
   - Accept: `{ image: string, roastText: string }`
   - Use `getImageGenerationModel()` from existing utils
   - Create prompt that generates a meme-style image with text overlay
   - Return base64 encoded image data

2. **Create meme generation prompt** - Prompt template for meme generation
   - Location: `src/app/api/prompts/generate-meme.md`
   - Dependencies: None
   - Validation: Prompt generates appropriate meme-style images

   Prompt should instruct Gemini to:
   - Take the costume image and roast text
   - Generate a meme-format image with bold text overlay
   - Use high-contrast text for readability
   - Keep the costume visible in the background
   - Use a typical meme aesthetic (impact font style, top/bottom text layout)

3. **Add validation for meme generation request** - Request validation
   - Location: `src/app/api/utils/validation.ts`
   - Dependencies: Existing validation patterns
   - Validation: Invalid requests are properly rejected

   Add:
   - `validateGenerateMemeRequest()` function
   - `GenerateMemeRequest` type
   - `GenerateMemeResponse` type

### Phase 2: Frontend Implementation

4. **Add meme generation state** - State management for meme feature
   - Location: `src/app/results/page.tsx`
   - Dependencies: Existing state hooks
   - Validation: State properly manages loading/error/success states

   Add state variables:
   - `generatedMeme: string | null` - Stores the generated meme image
   - `isGeneratingMeme: boolean` - Loading state
   - `memeError: string | null` - Error state

5. **Add "Generate Meme" button** - UI button for meme generation
   - Location: `src/app/results/page.tsx` (right panel, below modification input)
   - Dependencies: lucide-react icons, meme state
   - Validation: Button appears, is disabled when appropriate

   Button requirements:
   - Only visible when `roastText` exists
   - Disabled during loading or if no roast
   - Uses lucide-react `ImagePlus` or `Share2` icon
   - Positioned below the modification input section
   - Consistent styling with existing buttons

6. **Implement handleGenerateMeme function** - Meme generation handler
   - Location: `src/app/results/page.tsx`
   - Dependencies: `/api/generate-meme` endpoint
   - Validation: Successfully generates and displays meme

   Function should:
   - Set loading state
   - Call `/api/generate-meme` with roast and image data
   - Handle success: set `generatedMeme` state
   - Handle errors: set `memeError` state
   - Clear loading state

7. **Update image display logic** - Show meme when generated
   - Location: `src/app/results/page.tsx` (AI Modified Costume section)
   - Dependencies: Meme state
   - Validation: Meme displays correctly when generated

   Display priority:
   1. If `generatedMeme` exists → show meme
   2. Else if `generatedImage` exists → show modified image
   3. Else if `modificationAnalysis` exists → show analysis
   4. Else → show "No modifications yet" placeholder

8. **Add meme error display** - Error UI for failed meme generation
   - Location: `src/app/results/page.tsx`
   - Dependencies: Meme error state
   - Validation: Errors display appropriately

   Show error message if meme generation fails

### Phase 3: Polish & Testing

9. **Add loading spinner for meme generation** - Visual feedback during generation
   - Location: `src/app/results/page.tsx`
   - Dependencies: Existing spinner component pattern
   - Validation: Loading state is clear to user

10. **Test meme generation flow** - End-to-end testing
    - Location: Browser testing
    - Dependencies: All above components
    - Validation: Complete flow works smoothly

    Test scenarios:
    - Upload image → get roast → generate meme
    - Handle API errors gracefully
    - Verify meme displays correctly
    - Test with various roast lengths

## Testing Requirements

### Unit Tests
- `validateGenerateMemeRequest()`: Validates request structure
- Prompt template loading: Loads meme generation prompt correctly

### Integration Tests
- `/api/generate-meme`: Full endpoint test with mock image and roast
- Error handling: API errors properly propagated to frontend
- State management: Meme state updates correctly through flow

### Manual Validation
- Generate meme with short roast text
- Generate meme with long roast text
- Verify meme is readable and visually appealing
- Test error states (network failure, API error)
- Verify loading states display correctly
- Test with different costume images
- Verify meme doesn't interfere with modification functionality

## Considerations & Alternatives

### Potential Considerations
- **Text readability**: Gemini's image generation may need specific prompting to ensure roast text is readable over costume images. May need to experiment with prompt wording.
- **Generation time**: Image generation can take 5-10 seconds. Need clear loading indicators.
- **Text length**: Very long roasts may not fit well in meme format. Consider truncating or using excerpt.
- **Meme quality**: First iteration may require prompt refinement based on output quality.
- **Cost**: Each meme generation uses Gemini API credits. Monitor usage.

### Alternative Approaches
- **Canvas-based meme generation**: Could use HTML canvas to overlay text on image client-side. Pros: faster, no API cost. Cons: Less sophisticated, requires manual text positioning and styling.
- **Third-party meme APIs**: Services like Imgflip API. Pros: specialized for memes. Cons: additional API dependency, cost.
- **Pre-built meme templates**: Use fixed meme templates (Drake, Distracted Boyfriend, etc.) and insert costume image. Pros: recognizable format. Cons: less customizable, may not fit all costumes.
- **Text overlay only**: Generate text-only meme cards without the costume image. Pros: simpler, faster. Cons: less engaging, loses visual context.

### Future Enhancements
- Download button for meme
- Share to social media functionality
- Multiple meme template/style options
- Custom text editing for meme
- Meme gallery/history
- Font and color customization
- Sticker/emoji overlays
