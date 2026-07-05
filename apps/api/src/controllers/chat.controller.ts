import chatService from "../services/chat.service.js";
import type { Request, Response } from "express";

class ChatController {
    
    chat(req: Request, res: Response) {
        const { message } = req.body;

        const response = chatService.generateResponse(message);

        res.json({
            response,
        });
    }
}

export default new ChatController();
