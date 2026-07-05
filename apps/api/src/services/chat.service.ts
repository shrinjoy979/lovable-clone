class ChatService {
    generateResponse(message: string) {
        return `You said ${message}`;
    }
}

export default new ChatService();