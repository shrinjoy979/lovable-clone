export const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

export const GEMINI_MODELS = [
  {
    id: "gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    requiresApiKey: false,
  },
  {
    id: "gemini-2.5-pro",
    label: "Gemini 2.5 Pro",
    requiresApiKey: true,
  },
] as const;

export type GeminiModelId = (typeof GEMINI_MODELS)[number]["id"];

export function getGeminiModel(id?: string) {
  return GEMINI_MODELS.find((model) => model.id === id) ?? GEMINI_MODELS[0];
}

export function modelRequiresApiKey(id?: string) {
  return Boolean(getGeminiModel(id)?.requiresApiKey);
}

/** Google AI Studio keys look like AIzaSy… (about 39 characters). */
export const GEMINI_API_KEY_PATTERN = /^AIza[0-9A-Za-z_-]{32,40}$/;

export function isValidGeminiApiKeyFormat(value: string) {
  return GEMINI_API_KEY_PATTERN.test(value.trim());
}

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatRequest {
  messages: Message[];
  model?: GeminiModelId;
  apiKey?: string;
}

export interface ChatResponse {
  response: string;
}

export interface GenerateOptions {
  messages: Message[];
  model?: GeminiModelId;
  apiKey?: string;
  signal?: AbortSignal;
}
