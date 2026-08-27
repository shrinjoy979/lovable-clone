import { GoogleGenAI } from "@google/genai";
import type { AIProvider } from "./ai-provider.interface.js";
import {
  DEFAULT_GEMINI_MODEL,
  type GenerateOptions,
  type Message,
} from "@repo/shared/chat";
import { env } from "../config/index.js";

function chunkText(chunk: {
  text?: string | undefined;
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string; thought?: boolean }> };
  }>;
}) {
  const parts = chunk.candidates?.[0]?.content?.parts ?? [];
  const fromParts = parts
    .filter((part) => part.text && !part.thought)
    .map((part) => part.text)
    .join("");

  if (fromParts) return fromParts;

  try {
    return chunk.text?.trim() ? chunk.text : "";
  } catch {
    return "";
  }
}

export class GeminiProvider implements AIProvider {
  private getClient(apiKey?: string) {
    const key = apiKey?.trim() || env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("Missing Gemini API key");
    }
    return new GoogleGenAI({ apiKey: key });
  }

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
    const client = this.getClient(options.apiKey);

    const response = await client.models.generateContent({
      model: options.model ?? DEFAULT_GEMINI_MODEL,
      contents,
      ...(systemInstruction ? { config: { systemInstruction } } : {}),
    });

    return response.text ?? "";
  }

  async *generateStream(options: GenerateOptions): AsyncGenerator<string> {
    const { messages, signal } = options;
    const { systemInstruction, contents } = this.splitMessages(messages);
    const client = this.getClient(options.apiKey);

    try {
      const stream = await client.models.generateContentStream({
        model: options.model ?? DEFAULT_GEMINI_MODEL,
        contents,
        config: {
          ...(systemInstruction ? { systemInstruction } : {}),
          ...(signal ? { abortSignal: signal } : {}),
        },
      });

      for await (const chunk of stream) {
        const text = chunkText(chunk);
        if (text) yield text;
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
