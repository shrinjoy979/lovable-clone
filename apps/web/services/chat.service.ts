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
        body: JSON.stringify(options),
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
        if (!event.startsWith("data: ")) continue;

        yield event.slice(6);
      }
    }
  }
}

export default new ChatService();