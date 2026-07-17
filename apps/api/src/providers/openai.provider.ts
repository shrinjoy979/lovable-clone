import OpenAI from "openai";
import type { AIProvider } from "./ai-provider.interface.js";
import type { Message } from "@repo/shared/chat";

export class OpenAIProvider implements AIProvider {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generate(messages: Message[]): Promise<string> {
    const prompt = messages
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n");

    const response = await this.client.responses.create({
      model: "gpt-5.5",
      input: prompt,
    });

    return response.output_text;
  }
}
