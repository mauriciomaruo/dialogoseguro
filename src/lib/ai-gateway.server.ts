import { createGoogleGenerativeAI } from "@ai-sdk/google";

export function createLovableAiGatewayProvider(apiKey: string) {
  const google = createGoogleGenerativeAI({
    apiKey: apiKey || process.env.GEMINI_API_KEY,
  });

  return google("gemini-1.5-flash");
}
