import { z } from "zod";
import {
  DEFAULT_GEMINI_MODEL,
  GEMINI_MODELS,
  isValidGeminiApiKeyFormat,
  modelRequiresApiKey,
} from "@repo/shared/chat";

const geminiModelIds = GEMINI_MODELS.map((model) => model.id) as [
  (typeof GEMINI_MODELS)[number]["id"],
  ...(typeof GEMINI_MODELS)[number]["id"][],
];

export const geminiApiKeySchema = z
  .string()
  .trim()
  .refine(isValidGeminiApiKeyFormat, "Enter a valid Gemini API key");

export const chatSchema = z
  .object({
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
    apiKey: geminiApiKeySchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (modelRequiresApiKey(data.model) && !data.apiKey) {
      ctx.addIssue({
        code: "custom",
        path: ["apiKey"],
        message: "API key is required for this model",
      });
    }
  });

export type ChatRequest = z.infer<typeof chatSchema>;