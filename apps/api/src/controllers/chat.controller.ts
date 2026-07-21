import chatService from "../services/chat.service.js";
import type { Request, Response } from "express";
import { chatSchema } from "../validations/chat.validation.js";
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
            const response = await chatService.generateResponse(result.data);
            return res.json({ response });
        } catch (_error) {
            return res.status(500).json({
                error: "Failed to generate response"
            });
        }
    }

    async stream(req: Request, res: Response) {
        const result = chatSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                error: z.flattenError(result.error),
            });
        }

        const abortController = new AbortController();
        const onClose = () => abortController.abort();

        req.on("close", onClose);

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        res.flushHeaders();

        try {
            const stream = chatService.generateStream({
                messages: result.data.messages,
                signal: abortController.signal,
            });

            for await (const chunk of stream) {
                res.write(`data: ${chunk}\n\n`);
            }
        } catch(error) {
            console.error("Error in streaming", error);
            res.write(
                `event: error\ndata: Failed to generate response\n\n`
            );
        } finally {
            req.off("close", onClose);
            res.end();
        }        
    }
}

export default new ChatController();
