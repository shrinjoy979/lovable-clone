import type { GenerateOptions, Message } from "@repo/shared/chat";
import { getProvider } from "../providers/provider.factory.js";

class ChatService {
  async generateResponse(options: GenerateOptions): Promise<string> {
    const provider = getProvider();
    return provider.generate(options);
  }

  generateStream(options: GenerateOptions): AsyncGenerator<string> {
      const provider = getProvider();
      return provider.generateStream(options);
  }
}

export default new ChatService();