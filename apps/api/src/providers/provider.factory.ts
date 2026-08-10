import type { AIProvider } from "./ai-provider.interface.js";
import { GeminiProvider } from "./gemini.provider.js";
import { OpenAIProvider } from "./openai.provider.js";
import { env } from "../config/index.js";

export function getProvider(): AIProvider {
  switch (env.AI_PROVIDER) {
    case "openai":
      const openai = new OpenAIProvider();
      return openai;
    case "gemini":
    default:
      const gemini = new GeminiProvider();
      return gemini;
  }
}