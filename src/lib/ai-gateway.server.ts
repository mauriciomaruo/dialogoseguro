TypeScript
import { createOpenAI } from "@ai-sdk/openai";

export function createLovableAiGatewayProvider(apiKey: string) {
  return createOpenAI({
    apiKey: apiKey || process.env.OPENAI_API_KEY,
  });
}
