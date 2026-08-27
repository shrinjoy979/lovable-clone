import chatService from "../services/chat.service.js";
import type { Request, Response } from "express";
import { chatSchema, geminiApiKeySchema } from "../validations/chat.validation.js";
import { verifyGeminiApiKey } from "../lib/verify-gemini-key.js";
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
            const response = await chatService.generateResponse({
                messages: result.data.messages,
                model: result.data.model,
                apiKey: result.data.apiKey,
            });
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
                model: result.data.model,
                apiKey: result.data.apiKey,
                signal: abortController.signal,
            });

            for await (const chunk of stream) {
                res.write(`data: ${JSON.stringify(chunk)}\n\n`);
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

    async validateKey(req: Request, res: Response) {
        const result = z.object({ apiKey: geminiApiKeySchema }).safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                error: "Enter a valid Gemini API key from Google AI Studio",
            });
        }

        const valid = await verifyGeminiApiKey(result.data.apiKey);

        if (!valid) {
            return res.status(400).json({
                error: "This API key is not valid",
            });
        }

        return res.json({ valid: true });
    }
}

export default new ChatController();
