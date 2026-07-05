import { z } from "zod";

export const chatSchema = z.object({
    message: z
        .string()
        .trim()
        .min(1, "Message is required")
        .max(5000, "Message is too long")
});

export type ChatRequest = z.infer<typeof chatSchema>