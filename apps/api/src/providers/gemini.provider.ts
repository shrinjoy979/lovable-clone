import { GoogleGenAI } from "@google/genai";
import type { AIProvider } from "./ai-provider.interface.js";
import type { GenerateOptions, Message } from "@repo/shared/chat";

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

  async generate(options: GenerateOptions): Promise<string> {
    const { messages } = options;
    const prompt = this.mapMessages(messages);

    const response = await this.client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    return response.text ?? "";
  }

  async *generateStream(options: GenerateOptions): AsyncGenerator<string> {
    const { messages, signal } = options;
    const prompt = this.mapMessages(messages);

    try {
      const stream = await this.client.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents: prompt,
        ...(signal ? {config: {abortSignal: signal}} : {}),
      });
  
      for await (const chunk of stream) {
        if(chunk.text?.trim()) {
          yield chunk.text
        }
      }
    }catch(error) {
      throw new Error("Failed to stream response from gemini", { cause: error });
    }
  }
}
