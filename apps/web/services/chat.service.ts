import type { GenerateOptions } from "@repo/shared/chat";

class ChatService {
  async *generateStream(
    options: GenerateOptions
  ): AsyncGenerator<string> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/chat/stream`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: options.messages,
          model: options.model,
          ...(options.apiKey ? { apiKey: options.apiKey } : {}),
        }),
        signal: options.signal,
      }
    );

    if (!response.ok || !response.body) {
      throw new Error("Failed to start stream");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, {
        stream: true,
      });

      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";

      for (const event of events) {
        const lines = event.split("\n");
        const isError = lines.some((entry) => entry.startsWith("event: error"));
        const line = lines.find((entry) => entry.startsWith("data: "));

        if (!line) continue;

        const payload = line.slice(6);

        if (isError) {
          throw new Error(payload || "Failed to generate response");
        }

        try {
          yield JSON.parse(payload) as string;
        } catch {
          yield payload;
        }
      }
    }
  }

  async validateApiKey(apiKey: string): Promise<void> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/chat/validate-key`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey }),
      }
    );

    if (response.ok) return;

    const payload = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;

    throw new Error(payload?.error || "This API key is not valid");
  }
}

export default new ChatService();
