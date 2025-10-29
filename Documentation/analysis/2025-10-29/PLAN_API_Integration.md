# Implementation Plan: API Integration for Frontend

## Context & Motivation

The frontend UI is built but the APIs are not yet connected to the actual user interface. Currently:
- The `page.tsx` home page uploads an image and navigates to `/results`
- The `results/page.tsx` displays the image but uses browser's Web Speech API instead of the backend audio generation
- The `/api/generate-roast` endpoint expects `costumeType`, `failPoints`, and `analysis` but the frontend only sends `imageData`
- The `/api/modify-image` endpoint is called but doesn't generate actual images (returns analysis only)
- The `/api/analyze` endpoint exists but is never called by the frontend

We need to:
1. Call `/api/analyze` when an image is uploaded to get costume analysis
2. Use that analysis to call `/api/generate-roast` with proper parameters
3. When user clicks play, call `/api/generate-audio` with the roast text and selected voice
4. Update `/api/modify-image` to actually generate images or properly integrate with the UI

## Scope

### Included
- Integration of `/api/analyze` after image upload
- Proper integration of `/api/generate-roast` with analysis data
- Integration of `/api/generate-audio` for voice playback with character selection
- Update image modification flow to properly handle API responses
- State management for loading states and error handling
- Display of costume analysis data in the UI

### Excluded
- Actual image generation implementation in `/api/modify-image` (noted as future work)
- UI/UX redesigns beyond what's necessary for API integration
- Additional API endpoints
- Voice reference ID mapping (will use default voices)

## Technical Approach

**Flow:**
1. **Upload Flow (page.tsx → results/page.tsx):**
   - User uploads image → Navigate to results with image data
   - On results page load → Call `/api/analyze` with image
   - Store analysis data in component state
   - Automatically call `/api/generate-roast` with analysis data
   - Display roast text in UI

2. **Audio Playback Flow (results/page.tsx):**
   - User selects character voice from dropdown
   - User clicks play → Call `/api/generate-audio` with roast text and selected voice
   - Stream/play audio response instead of using Web Speech API
   - Show proper loading and error states

3. **Image Modification Flow (results/page.tsx):**
   - User enters modification request
   - Call `/api/modify-image` with image and prompt
   - Display analysis/response (image generation to be added later)

## Implementation Steps

### Phase 1: Analyze API Integration

1. **Update results page to call analyze API on mount**
   - Location: `src/app/results/page.tsx:46-79`
   - Dependencies: Costume data loaded from sessionStorage
   - Validation: Analysis data (costumeType, failPoints, overallAssessment) stored in state
   - Implementation:
     - Add state for analysis data: `costumeType`, `failPoints`, `overallAssessment`
     - Create `analyzeImage()` function that calls `/api/analyze`
     - Call in useEffect when `costumeData` is available
     - Handle loading and error states

2. **Update generate-roast API call to use analysis data**
   - Location: `src/app/results/page.tsx:46-79`
   - Dependencies: Analysis API call must complete successfully
   - Validation: Roast text generated and displayed
   - Implementation:
     - Modify existing `generateRoast()` to wait for analysis data
     - Send `costumeType`, `failPoints`, and full analysis text
     - Update request body to match API expectations

3. **Display analysis data in UI**
   - Location: `src/app/results/page.tsx` (add new section)
   - Dependencies: Analysis data available in state
   - Validation: Costume type and fail points visible to user
   - Implementation:
     - Add section below roast player to show costume analysis
     - Display costume type as heading
     - List fail points as bullet points (optional enhancement)

### Phase 2: Audio API Integration

4. **Map voice characters to Fish Audio reference IDs**
   - Location: `src/app/results/page.tsx:13-23`
   - Dependencies: Fish Audio API documentation/testing
   - Validation: Voice mapping constant created
   - Implementation:
     - Research Fish Audio voice reference IDs for characters
     - Create `VOICE_REFERENCE_MAP` mapping VoiceOption to reference_id
     - If IDs not available, use defaults and add TODO comment

5. **Replace Web Speech API with generate-audio API**
   - Location: `src/app/results/page.tsx:81-125`
   - Dependencies: Voice mapping complete, roast text available
   - Validation: Audio plays from API instead of browser TTS
   - Implementation:
     - Replace `handlePlayRoast()` implementation
     - Call `/api/generate-audio` with roast text and reference_id
     - Create Audio element from returned blob/buffer
     - Implement proper playback controls (play/pause/stop)
     - Track audio progress using audio element events
     - Handle loading and error states

6. **Update audio progress tracking**
   - Location: `src/app/results/page.tsx:81-125`
   - Dependencies: Audio element created from API response
   - Validation: Progress bar accurately reflects audio playback
   - Implementation:
     - Listen to `timeupdate` event on audio element
     - Calculate progress: `(currentTime / duration) * 100`
     - Update `audioProgress` state
     - Handle edge cases (audio not loaded, duration unknown)

### Phase 3: Error Handling & Loading States

7. **Add loading states for API calls**
   - Location: `src/app/results/page.tsx` (multiple locations)
   - Dependencies: All API integration points identified
   - Validation: User sees loading indicators during API calls
   - Implementation:
     - Add `isLoadingAnalysis` state
     - Add `isLoadingAudio` state
     - Update UI to show spinners/skeletons during loading
     - Disable controls while loading

8. **Implement comprehensive error handling**
   - Location: `src/app/results/page.tsx` (all API call sites)
   - Dependencies: All API calls wrapped in try-catch
   - Validation: User-friendly error messages displayed
   - Implementation:
     - Add error state variables for each API call
     - Display error messages in UI (non-intrusive)
     - Add retry mechanisms where appropriate
     - Log errors for debugging

### Phase 4: Image Modification Enhancement

9. **Update modify-image flow for better UX**
   - Location: `src/app/results/page.tsx:133-169`
   - Dependencies: None
   - Validation: Better feedback when image modification is called
   - Implementation:
     - Display analysis text returned from API
     - Show placeholder message that actual image generation is coming soon
     - Store modification history (optional)
     - Add visual feedback for successful API call

## Testing Requirements

### Unit Tests
- `results/page.tsx`: Test analysis API call on mount
- `results/page.tsx`: Test roast generation with proper parameters
- `results/page.tsx`: Test audio playback with character voice selection
- Error handling for each API call

### Integration Tests
- **Full roast flow**: Upload image → Analyze → Generate roast → Play audio
- **Image modification flow**: Upload → Modify image → Display result
- **Error recovery**: API failures → User sees error → Can retry

### Manual Validation
- Upload costume image, verify analysis appears correctly
- Verify roast is generated automatically after analysis
- Select different character voices, verify audio plays with correct voice
- Test image modification request, verify analysis displayed
- Test error cases: network failure, API errors, invalid responses
- Verify loading states show appropriately
- Test audio controls: play, pause, progress bar accuracy

## Considerations & Alternatives

### Potential Considerations
- **API Rate Limiting**: Multiple sequential API calls (analyze → roast → audio) may hit rate limits
  - Consider showing estimated wait times
  - Implement exponential backoff for retries
- **Audio File Size**: Audio responses may be large
  - Consider streaming if Fish Audio API supports it
  - Show download progress for large audio files
- **Voice Availability**: Fish Audio may not have all character voices
  - Fallback to closest available voice
  - Document which voices are available
- **Session Storage**: Image data stored in sessionStorage may be lost on page refresh
  - Consider adding warning before user navigates away
  - Or implement localStorage persistence

### Alternative Approaches
- **Parallel API Calls**: Could call analyze and start generating roast simultaneously
  - Trade-off: May waste API quota if analysis fails
  - Chosen approach: Sequential for reliability
- **Server-Side Generation**: Could move entire flow to server
  - Trade-off: Longer initial load, but simpler client
  - Current approach: Client orchestrates for better UX and loading states
- **WebSocket for Audio**: Could stream audio generation progress
  - Trade-off: More complex implementation
  - Future optimization when audio generation is slow
- **Actual Image Generation**: Could integrate DALL-E, Stable Diffusion, or Imagen for `/api/modify-image`
  - Trade-off: Additional API costs and complexity
  - Future enhancement after core flow is working

## Future Enhancements
- Implement actual image generation in `/api/modify-image` using DALL-E or similar
- Add ability to regenerate roast with different tone/style
- Save favorite roasts/modifications
- Share functionality (social media, copy link)
- Download roast audio file
- Batch processing for multiple costume images
