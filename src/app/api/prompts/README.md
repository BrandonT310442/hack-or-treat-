# API Prompts

This directory contains all the prompts used by the API endpoints in markdown format.

## Prompt Files

- **analyze-costume.md** - Analyzes costume images and identifies failures
- **generate-roast.md** - Generates humorous roasts based on costume analysis
- **generate-costume.md** - Creates improved costume images

## Template Variables

Prompts can include template variables using the `{{variableName}}` syntax. These are replaced at runtime using the `fillPromptTemplate` function.

### Example

```markdown
Transform this {{costumeType}} costume into a professional version.
```

When called with `{ costumeType: "Dracula" }`, becomes:

```
Transform this Dracula costume into a professional version.
```

## Usage in API Routes

```typescript
import { loadPrompt, fillPromptTemplate } from "../utils/prompts";

// Simple prompt loading
const prompt = loadPrompt('analyze-costume');

// Prompt with variables
const template = loadPrompt('generate-roast');
const prompt = fillPromptTemplate(template, {
  costumeType: "Dracula",
  failPoints: ["cheap cape", "plastic fangs"],
  analysis: "Poor quality materials"
});
```

## Adding New Prompts

1. Create a new `.md` file in this directory
2. Use `{{variableName}}` for any dynamic values
3. Load it in your API route using `loadPrompt('filename-without-extension')`
4. Use `fillPromptTemplate()` if you have variables to replace
