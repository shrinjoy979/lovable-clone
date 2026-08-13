"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { Message } from "@repo/shared/chat";

import { loadSessions, saveSessions } from "../lib/chat-storage";
import chatService from "../services/chat.service";
import {
  createChatSession,
  titleFromMessage,
  type ChatSession,
} from "../types/chat";

export function useChat() {
  const [hydrated, setHydrated] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const { sessions: storedSessions, activeId: storedActiveId } =
      loadSessions();
    setSessions(storedSessions);
    setActiveId(storedActiveId);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || !activeId) return;
    saveSessions(sessions, activeId);
  }, [sessions, activeId, hydrated]);

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeId) ?? null,
    [sessions, activeId]
  );

  const messages = activeSession?.messages ?? [];

  function patchSession(
    sessionId: string,
    updater: (session: ChatSession) => ChatSession
  ) {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId ? updater(session) : session
      )
    );
  }

  function updateLastMessage(sessionId: string, content: string) {
    patchSession(sessionId, (session) => {
      const updatedMessages = [...session.messages];
      const lastMessage = updatedMessages[updatedMessages.length - 1];

      if (!lastMessage) {
        return session;
      }

      updatedMessages[updatedMessages.length - 1] = {
        ...lastMessage,
        content,
      };

      return {
        ...session,
        messages: updatedMessages,
        updatedAt: Date.now(),
      };
    });
  }

  async function sendMessage(content: string) {
    if (!activeSession) return;

    const sessionId = activeSession.id;

    const userMessage: Message = {
      role: "user",
      content,
    };

    const assistantMessage: Message = {
      role: "assistant",
      content: "",
    };

    const conversation: Message[] = [...activeSession.messages, userMessage];
    const shouldRename = activeSession.title === "New chat";

    patchSession(sessionId, (session) => ({
      ...session,
      title: shouldRename ? titleFromMessage(content) : session.title,
      messages: [...conversation, assistantMessage],
      updatedAt: Date.now(),
    }));

    setIsLoading(true);

    try {
      let response = "";
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const stream = chatService.generateStream({
        messages: conversation,
        signal: abortController.signal,
      });

      for await (const chunk of stream) {
        response += chunk;
        updateLastMessage(sessionId, response);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        console.log("Generation stopped by user.");
      } else {
        console.error(error);
        updateLastMessage(sessionId, "Something went wrong.");
      }
    } finally {
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }

  function stopGeneration() {
    abortControllerRef.current?.abort();
  }

  function createChat() {
    stopGeneration();
    const session = createChatSession();
    setSessions((prev) => [session, ...prev]);
    setActiveId(session.id);
  }

  function selectChat(id: string) {
    if (id === activeId) return;
    stopGeneration();
    setActiveId(id);
  }

  function deleteChat(id: string) {
    stopGeneration();

    setSessions((prev) => {
      const next = prev.filter((session) => session.id !== id);

      if (!next.length) {
        const session = createChatSession();
        setActiveId(session.id);
        return [session];
      }

      if (id === activeId) {
        setActiveId(next[0]!.id);
      }

      return next;
    });
  }

  return {
    hydrated,
    sessions,
    activeId,
    messages,
    isLoading,
    sendMessage,
    stopGeneration,
    createChat,
    selectChat,
    deleteChat,
  };
}
