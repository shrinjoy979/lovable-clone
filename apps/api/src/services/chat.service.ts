import type { GenerateOptions, Message } from "@repo/shared/chat";
import { getProvider } from "../providers/provider.factory.js";

class ChatService {
  async generateResponse(options: GenerateOptions): Promise<string> {
    const provider = getProvider();

    return provider.generate(options);
  }
}

export default new ChatService();