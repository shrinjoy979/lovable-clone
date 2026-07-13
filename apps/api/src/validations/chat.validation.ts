import { z } from "zod";

export const chatSchema = z.object({
    message: z
        .string()
        .trim()
        .min(1, "Message is required")
        .max(5000, "Message is too long")
});

export const chatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string().min(1),
    })
  ),
});

export type ChatRequest = z.infer<typeof chatSchema>