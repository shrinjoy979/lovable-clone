import type { Message } from "@repo/shared/chat";

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

export const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content: "Hello! How can I help you today?",
};

export function createChatSession(): ChatSession {
  return {
    id: crypto.randomUUID(),
    title: "New chat",
    messages: [WELCOME_MESSAGE],
    updatedAt: Date.now(),
  };
}

export function titleFromMessage(content: string): string {
  const cleaned = content.trim().replace(/\s+/g, " ");
  if (!cleaned) return "New chat";
  return cleaned.length > 42 ? `${cleaned.slice(0, 42)}…` : cleaned;
}
