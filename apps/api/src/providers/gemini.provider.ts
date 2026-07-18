import { GoogleGenAI } from "@google/genai";
import type { AIProvider } from "./ai-provider.interface.js";
import type { Message } from "@repo/shared/chat";

export class GeminiProvider implements AIProvider {
  private client = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
  });

  private mapMessages(messages: Message[]): string {
    const prompt = messages
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n");

      return prompt;
  }

  async generate(messages: Message[]): Promise<string> {
    const prompt = this.mapMessages(messages);

    const response = await this.client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text ?? "";
  }
}
