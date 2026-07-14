import { z } from "zod";

export const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z
          .string()
          .trim()
          .min(1, "Content is required")
          .max(5000, "Content is too long"),
      })
    )
    .min(1, "At least one message is required"),
});

export type ChatRequest = z.infer<typeof chatSchema>;