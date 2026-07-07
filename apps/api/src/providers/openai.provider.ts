import OpenAI from "openai";
import type { AIProvider } from "./ai-provider.interface.js";

export class OpenAIProvider implements AIProvider {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generate(prompt: string): Promise<string> {
    const response = await this.client.responses.create({
      model: "gpt-5.5",
      input: prompt,
    });

    return response.output_text;
  }
}
