import chatService from "../services/chat.service.js";
import type { Request, Response } from "express";
import { chatSchema } from "../validations/chat.validation.js";
import { z } from "zod";


class ChatController {
    chat(req: Request, res: Response) {
        const result = chatSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                error: z.flattenError(result.error),
            });
        }

        const response = chatService.generateResponse(result.data.message);

        res.json({
            response,
        });
    }
}

export default new ChatController();
