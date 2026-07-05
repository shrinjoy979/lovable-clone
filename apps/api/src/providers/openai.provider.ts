import OpenAI from "openai";

class OpenAIProvider {
  private getClient() {
    console.log("Key", process.env.OPENAI_API_KEY);
    return new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generate(prompt: string) {
    const client = this.getClient();

    return await client.responses.create({
      model: "gpt-5.5",
      input: prompt,
    });
  }
}

export default new OpenAIProvider();