import { isValidGeminiApiKeyFormat } from "@repo/shared/chat";

export async function verifyGeminiApiKey(apiKey: string): Promise<boolean> {
  if (!isValidGeminiApiKeyFormat(apiKey)) {
    return false;
  }

  const url = new URL("https://generativelanguage.googleapis.com/v1beta/models");
  url.searchParams.set("key", apiKey.trim());
  url.searchParams.set("pageSize", "1");

  try {
    const response = await fetch(url, { method: "GET" });
    return response.ok;
  } catch {
    return false;
  }
}
