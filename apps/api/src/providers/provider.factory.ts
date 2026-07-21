import type { AIProvider } from "./ai-provider.interface.js";
import { GeminiProvider } from "./gemini.provider.js";
import { OpenAIProvider } from "./openai.provider.js";

export function getProvider(): AIProvider {
  switch (process.env.AI_PROVIDER) {
    case "openai":
      const openai = new OpenAIProvider();
      return openai;
    case "gemini":
    default:
      const gemini = new GeminiProvider();
      return gemini;
  }
}