import { z } from "zod";
import { DEFAULT_GEMINI_MODEL, GEMINI_MODELS } from "@repo/shared/chat";

const geminiModelIds = GEMINI_MODELS.map((model) => model.id) as [
  (typeof GEMINI_MODELS)[number]["id"],
  ...(typeof GEMINI_MODELS)[number]["id"][],
];

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
  model: z.enum(geminiModelIds).default(DEFAULT_GEMINI_MODEL),
});

export type ChatRequest = z.infer<typeof chatSchema>;