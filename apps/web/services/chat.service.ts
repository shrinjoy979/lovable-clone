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
        const line = event
          .split("\n")
          .find((entry) => entry.startsWith("data: "));

        if (!line) continue;

        const payload = line.slice(6);

        try {
          yield JSON.parse(payload) as string;
        } catch {
          // Backward-compatible with older unencoded streams
          yield payload;
        }
      }
    }
  }
}

export default new ChatService();
