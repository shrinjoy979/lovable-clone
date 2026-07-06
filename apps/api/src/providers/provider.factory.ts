import type { AIProvider } from "./ai-provider.interface.js";
import geminiProvider from "./gemini.provider.js";
import OpenAIProvider from "./openai.provider.js";

export function getProvider(): AIProvider {
  switch (process.env.AI_PROVIDER) {
    case "openai":
      return OpenAIProvider;

    case "gemini":
    default:
      return geminiProvider;
  }
}