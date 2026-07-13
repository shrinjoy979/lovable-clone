import chatService from "../services/chat.service.js";
import type { Request, Response } from "express";
import { chatSchema } from "../validations/chat.validation.js";
import type { ChatRequest } from "@repo/shared/chat";
import { z } from "zod";

class ChatController {
    async chat(req: Request, res: Response) {
        const result = chatSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                error: z.flattenError(result.error),
            });
        }

        try {
            const body = result.data as ChatRequest;
            const response = await chatService.generateResponse(body.messages);
            return res.json({ response });
        } catch (error) {
            return res.status(500).json({
                error: "Failed to generate response"
            });
        }
    }
}

export default new ChatController();
