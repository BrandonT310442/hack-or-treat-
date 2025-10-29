# Implementation Plan: Image Upload Page

## Context & Motivation

We're building the first user-facing feature of the AI Costume Roaster web app - the image upload page. This is the critical entry point where users can upload an existing image of their costume. This page needs to be intuitive, visually engaging with Halloween theming, and technically robust to handle file uploads.

**Current State:** Fresh Next.js 16 project with Tailwind CSS v4, React 19, and TypeScript. The codebase has a basic homepage template that needs to be replaced with the upload functionality.

**Desired Outcome:** A polished, Halloween-themed image upload page that allows users to:
- Upload existing images from their device
- Preview their selected image
- Proceed to the roasting flow

## Scope

### Included
- Halloween-themed landing page with branding
- File upload functionality (drag-and-drop + click to browse)
- Image preview with basic validation
- Image format validation (JPG, PNG, WebP)
- File size validation (max 20MB)
- Responsive design (mobile-first)
- Loading states and user feedback
- Error handling for file issues
- "Roast Me" button to proceed with selected image
- Basic Halloween color scheme and styling

### Excluded
- Backend API integration (will be in next phase)
- Image compression/optimization (can be added later if needed)
- Multiple image upload
- Image editing tools (crop, rotate, filters)
- User authentication
- Social media integration
- Roast generation (separate feature)

## Technical Approach

**Framework:** Next.js 16 App Router with React 19 and TypeScript
**Styling:** Tailwind CSS v4 for rapid, consistent styling
**State Management:** React hooks (useState, useEffect)
**File Handling:** HTML5 File API with drag-and-drop support

**Component Architecture:**
- `/src/app/page.tsx` - Main upload page (replace existing homepage)
- `/src/components/ImageUpload.tsx` - Image upload component with file upload
- `/src/components/ImagePreview.tsx` - Preview component with validation feedback
- `/src/utils/imageValidation.ts` - Image validation utilities
- `/src/types/upload.ts` - TypeScript types for upload flow

## Implementation Steps

### Phase 1: Project Setup & Dependencies
1. **Install Additional Dependencies** - Set up required packages
   - Location: Root directory
   - Dependencies: None (all needed APIs are browser-native)
   - Validation: Confirm no additional packages needed for MVP
   - Action: Verify current setup is sufficient

2. **Create Type Definitions** - Define TypeScript interfaces
   - Location: `/src/types/upload.ts`
   - Dependencies: None
   - Types needed:
     - `UploadMode`: 'upload' | 'preview'
     - `ImageData`: { file: File, dataUrl: string, isValid: boolean, error?: string }
     - `ValidationResult`: { isValid: boolean, error?: string }
   - Validation: Types compile without errors

3. **Create Utility Functions** - Image validation helpers
   - Location: `/src/utils/imageValidation.ts`
   - Dependencies: Type definitions
   - Functions:
     - `validateImageFile(file: File): ValidationResult`
     - `validateFileSize(file: File, maxSizeMB: number): boolean`
     - `validateFileType(file: File): boolean`
     - `convertFileToDataUrl(file: File): Promise<string>`
   - Validation: Unit tests pass (or manual testing for MVP)

### Phase 2: Component Development
4. **Create ImageUpload Component** - Main upload interface
   - Location: `/src/components/ImageUpload.tsx`
   - Dependencies: Type definitions, validation utils
   - Features:
     - File input with drag-and-drop zone
     - Click to browse file selector
     - Visual feedback for drag-over state
     - Accept: .jpg, .jpeg, .png, .webp
   - Validation: File selection works, drag-and-drop functions

5. **Create ImagePreview Component** - Preview uploaded image
   - Location: `/src/components/ImagePreview.tsx`
   - Dependencies: Type definitions
   - Features:
     - Display selected image
     - Show validation status/errors
     - "Choose Different Photo" button
     - "Roast Me" CTA button
     - Image dimensions and size display
   - Validation: Preview renders correctly, buttons trigger expected actions

### Phase 3: Main Page Implementation
6. **Update Homepage** - Replace template with upload interface
   - Location: `/src/app/page.tsx`
   - Dependencies: ImageUpload, ImagePreview components
   - Implementation:
     - Replace template content
     - Add Halloween-themed hero section
     - Integrate ImageUpload component
     - State management for upload flow
     - Conditional rendering based on upload state
     - Error boundary for graceful failures
   - Validation: Page loads, components render, flow works end-to-end

7. **Update Layout Metadata** - Update app metadata
   - Location: `/src/app/layout.tsx`
   - Dependencies: None
   - Changes:
     - Update title to "AI Costume Roaster"
     - Update description
     - Add Halloween-themed meta tags
   - Validation: Metadata appears correctly in browser

### Phase 4: Styling & UX Polish
8. **Implement Halloween Theme** - Apply color scheme and design
   - Location: `/src/app/globals.css` + component files
   - Dependencies: Tailwind CSS configuration
   - Design elements:
     - Color scheme: Orange (#FF6B35), Purple (#6A0DAD), Lime (#32CD32)
     - Dark background with subtle texture/gradient
     - Spooky typography (bold, dramatic headings)
     - Button hover effects
     - Loading spinners/animations
   - Validation: Visual design matches specifications, responsive on mobile/desktop

9. **Add Loading States** - User feedback during async operations
    - Location: All async operations in components
    - Dependencies: None
    - Implementation:
      - File processing spinner
      - Validation feedback messages
      - Disabled states for buttons during processing
    - Validation: Loading states appear during operations, no janky UX

10. **Implement Error Handling** - Graceful error states
    - Location: All components
    - Dependencies: Validation utilities
    - Error scenarios:
      - Invalid file type
      - File size too large
      - Browser doesn't support features
      - Generic errors with retry option
    - Validation: Each error scenario displays appropriate message

### Phase 5: Responsive Design & Accessibility
11. **Mobile Optimization** - Ensure mobile-first design
    - Location: All components and pages
    - Dependencies: None
    - Implementation:
      - Test on various screen sizes
      - Touch-friendly button sizes
      - Appropriate font scaling
      - Portrait/landscape handling
    - Validation: Works smoothly on mobile devices

12. **Accessibility Improvements** - WCAG compliance basics
    - Location: All components
    - Dependencies: None
    - Implementation:
      - Proper ARIA labels
      - Keyboard navigation support
      - Focus indicators
      - Alt text for images
      - Semantic HTML elements
    - Validation: Keyboard navigation works, screen reader friendly

### Phase 6: Integration Preparation
13. **Add Image State Management** - Prepare for backend integration
    - Location: `/src/app/page.tsx`
    - Dependencies: ImageData type
    - Implementation:
      - Store selected image in state
      - Prepare image data for API submission
      - Add placeholder navigation to results page
      - Store image as base64 for API transmission
    - Validation: Image data structure matches API requirements

14. **Create Results Page Placeholder** - Next step in user flow
    - Location: `/src/app/results/page.tsx`
    - Dependencies: None
    - Implementation:
      - Basic page structure
      - Receive image data via state/params
      - Display "Coming soon - roasting in progress" message
      - Show uploaded image
    - Validation: Navigation from upload to results works

## Testing Requirements

### Unit Tests (Optional for MVP but recommended)
- **Image Validation**: Test file type, size validation functions
- **File Conversion**: Test base64 conversion utility
- **Error Handling**: Test validation error messages

### Integration Tests
- **Upload Flow**: Select file → validate → preview → proceed
- **Drag-and-Drop Flow**: Drag image → validate → preview → proceed
- **Error Scenarios**: Test each error condition end-to-end

### Manual Validation
- Test on Chrome, Firefox, Safari (desktop)
- Test on iOS Safari and Chrome (mobile)
- Test on Android Chrome (mobile)
- Verify drag-and-drop on desktop
- Verify file size limits
- Verify invalid file type rejection
- Test responsive breakpoints
- Verify Halloween theme renders correctly
- Test keyboard navigation
- Verify loading states appear appropriately

## Considerations & Alternatives

### Potential Considerations
- **File Size Limits**: 20MB may be too large for hackathon demo environment - monitor and adjust if needed
- **Browser Compatibility**: File API and drag-and-drop supported in all modern browsers
- **Image Orientation**: Mobile photos may have EXIF orientation data - may need rotation fix in future phase
- **Multiple Formats**: WebP may not be supported by all backend systems - verify Gemini API compatibility
- **State Persistence**: Consider storing image in sessionStorage to prevent loss on page refresh
- **Rate Limiting**: No rate limiting on upload - could be added later if abuse occurs

### Alternative Approaches
- **Image Compression**: Could compress images client-side before upload
  - Trade-off: Better performance but adds complexity - defer to post-MVP
- **Third-party Upload Library**: Could use react-dropzone for drag-and-drop
  - Trade-off: More features but additional dependency - native API sufficient for MVP
- **Cloud Storage**: Could upload to cloud storage instead of base64
  - Trade-off: Better for production but overkill for hackathon MVP

### Future Optimization Opportunities
- Add image cropping tool before upload
- Add filters/preview effects
- Implement client-side image compression
- Add batch upload for multiple costumes
- Store upload history in local storage
- Add "Try Example Costume" with sample images
- Implement progressive image loading
- Add image rotation controls
- Implement proper image optimization pipeline
