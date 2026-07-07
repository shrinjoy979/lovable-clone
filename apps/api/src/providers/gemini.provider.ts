import { GoogleGenAI } from "@google/genai";
import type { AIProvider } from "./ai-provider.interface.js";

export class GeminiProvider implements AIProvider {
  private client = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
  });

  async generate(prompt: string): Promise<string> {
    const response = await this.client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text ?? "";
  }
}