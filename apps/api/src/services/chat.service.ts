import type { Message } from "@repo/shared/chat";
import { getProvider } from "../providers/provider.factory.js";

class ChatService {
  async generateResponse(messages: Message[]): Promise<string> {
    const provider = getProvider();

    return provider.generate(messages);
  }
}

export default new ChatService();