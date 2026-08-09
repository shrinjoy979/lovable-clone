import type { GenerateOptions } from "@repo/shared/chat";

class ChatService {
  async generateResponse(options: GenerateOptions): Promise<string> {
    const response = await fetch( `${process.env.NEXT_PUBLIC_API_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      throw new Error("Failed to generate response");
    }

    const data = await response.json();

    return data.response;
  }
}

export default new ChatService();