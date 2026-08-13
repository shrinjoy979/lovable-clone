import type { ChatSession } from "../types/chat";
import { createChatSession } from "../types/chat";

const STORAGE_KEY = "lovable-chat-sessions";
const ACTIVE_KEY = "lovable-active-chat-id";

export function loadSessions(): {
  sessions: ChatSession[];
  activeId: string;
} {
  if (typeof window === "undefined") {
    const session = createChatSession();
    return { sessions: [session], activeId: session.id };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const sessions = raw ? (JSON.parse(raw) as ChatSession[]) : [];
    const activeId = window.localStorage.getItem(ACTIVE_KEY);

    if (!sessions.length) {
      const session = createChatSession();
      return { sessions: [session], activeId: session.id };
    }

    const validActive =
      activeId && sessions.some((session) => session.id === activeId)
        ? activeId
        : sessions[0]!.id;

    return { sessions, activeId: validActive };
  } catch {
    const session = createChatSession();
    return { sessions: [session], activeId: session.id };
  }
}

export function saveSessions(sessions: ChatSession[], activeId: string) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  window.localStorage.setItem(ACTIVE_KEY, activeId);
}
