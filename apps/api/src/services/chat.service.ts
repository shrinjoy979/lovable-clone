import openAIProvider from "../providers/openai.provider.js";

class ChatService {
    async generateResponse(message: string) {
        return await openAIProvider.generate(message);
    }
}

export default new ChatService();
