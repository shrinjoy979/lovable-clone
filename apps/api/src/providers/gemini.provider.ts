import { GoogleGenAI } from "@google/genai";
import type { AIProvider } from "./ai-provider.interface.js";
import {
  DEFAULT_GEMINI_MODEL,
  type GenerateOptions,
  type Message,
} from "@repo/shared/chat";
import { env } from "../config/index.js";

export class GeminiProvider implements AIProvider {
  private client = new GoogleGenAI({
    apiKey: env.GEMINI_API_KEY!,
  });

  private splitMessages(messages: Message[]) {
    const systemInstruction = messages
      .filter((message) => message.role === "system")
      .map((message) => message.content)
      .join("\n\n");

    const contents = messages
      .filter((message) => message.role !== "system")
      .map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        parts: [{ text: message.content }],
      }));

    return { systemInstruction, contents };
  }

  async generate(options: GenerateOptions): Promise<string> {
    const { messages } = options;
    const { systemInstruction, contents } = this.splitMessages(messages);

    const response = await this.client.models.generateContent({
      model: options.model ?? DEFAULT_GEMINI_MODEL,
      contents,
      ...(systemInstruction
        ? { config: { systemInstruction } }
        : {}),
    });

    return response.text ?? "";
  }

  async *generateStream(options: GenerateOptions): AsyncGenerator<string> {
    const { messages, signal } = options;
    const { systemInstruction, contents } = this.splitMessages(messages);

    try {
      const stream = await this.client.models.generateContentStream({
        model: options.model ?? DEFAULT_GEMINI_MODEL,
        contents,
        config: {
          ...(systemInstruction ? { systemInstruction } : {}),
          ...(signal ? { abortSignal: signal } : {}),
        },
      });

      for await (const chunk of stream) {
        if (chunk.text?.trim()) {
          yield chunk.text;
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw error;
      }

      throw new Error("Failed to stream response from gemini", {
        cause: error,
      });
    }
  }
}
