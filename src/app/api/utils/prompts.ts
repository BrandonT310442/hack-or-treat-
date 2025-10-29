import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Load a prompt from a markdown file
 * @param promptName - Name of the prompt file (without .md extension)
 * @returns The prompt content as a string
 */
export function loadPrompt(promptName: string): string {
  const promptPath = join(process.cwd(), 'src', 'app', 'api', 'prompts', `${promptName}.md`);
  try {
    return readFileSync(promptPath, 'utf-8');
  } catch (error) {
    console.error(`Failed to load prompt: ${promptName}`, error);
    throw new Error(`Prompt file not found: ${promptName}`);
  }
}

/**
 * Replace template variables in a prompt
 * @param prompt - The prompt template
 * @param variables - Object with variable names and values
 * @returns The prompt with variables replaced
 */
export function fillPromptTemplate(
  prompt: string,
  variables: Record<string, string | string[]>
): string {
  let filledPrompt = prompt;

  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    const replacement = Array.isArray(value) ? value.join(', ') : value;
    filledPrompt = filledPrompt.replace(new RegExp(placeholder, 'g'), replacement);
  }

  return filledPrompt;
}
