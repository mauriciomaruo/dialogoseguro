export function createLovableAiGatewayProvider(apiKey: string) {
  const key = apiKey || process.env.GEMINI_API_KEY;

  return {
    async languageModel(modelId: string) {
      return {
        async doGenerate(options: any) {
          const contents = options.prompt.map((p: any) => ({
            role: p.role === "assistant" ? "model" : "user",
            parts: [{ text: p.content }],
          }));

          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ contents }),
            }
          );

          const data = await response.json();
          const responseText =
            data.candidates?.[0]?.content?.parts?.[0]?.text || "";

          return {
            text: responseText,
            finishReason: "stop",
          };
        },
      };
    },
  };
}
