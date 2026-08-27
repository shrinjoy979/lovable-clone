import { isValidGeminiApiKeyFormat } from "@repo/shared/chat";

const API_KEY_STORAGE_KEY = "lovable-clone:gemini-api-key";

export function readGeminiApiKey() {
  if (typeof window === "undefined") return "";
  const stored = window.localStorage.getItem(API_KEY_STORAGE_KEY)?.trim() ?? "";
  if (!isValidGeminiApiKeyFormat(stored)) {
    if (stored) window.localStorage.removeItem(API_KEY_STORAGE_KEY);
    return "";
  }
  return stored;
}

export function saveGeminiApiKey(apiKey: string) {
  const next = apiKey.trim();
  if (!isValidGeminiApiKeyFormat(next)) {
    throw new Error("Enter a valid Gemini API key from Google AI Studio");
  }
  window.localStorage.setItem(API_KEY_STORAGE_KEY, next);
}

export function hasGeminiApiKey() {
  return Boolean(readGeminiApiKey());
}
