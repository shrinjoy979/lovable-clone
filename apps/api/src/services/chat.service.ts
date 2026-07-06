import { getProvider } from "../providers/provider.factory.js";

class ChatService {
  async generateResponse(message: string) {
    const provider = getProvider();

    return provider.generate(message);
  }
}

export default new ChatService();
