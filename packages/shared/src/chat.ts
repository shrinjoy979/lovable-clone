export const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

export const GEMINI_MODELS = [
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
  { id: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite" },
] as const;

export type GeminiModelId = (typeof GEMINI_MODELS)[number]["id"];

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatRequest {
  messages: Message[];
  model?: GeminiModelId;
}

export interface ChatResponse {
  response: string;
}

export interface GenerateOptions {
  messages: Message[];
  model?: GeminiModelId;
  signal?: AbortSignal;
}
