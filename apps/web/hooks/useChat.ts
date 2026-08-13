"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { Message } from "@repo/shared/chat";

import { loadSessions, saveSessions } from "../lib/chat-storage";
import { parseGeneratedFiles } from "../lib/parse-files";
import { buildMessagesWithContext } from "../lib/system-prompt";
import chatService from "../services/chat.service";
import {
  createChatSession,
  titleFromMessage,
  type ChatSession,
  type ProjectFiles,
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
  const files = activeSession?.files ?? {};

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

  function mergeFiles(sessionId: string, nextFiles: ProjectFiles) {
    if (!Object.keys(nextFiles).length) return;

    patchSession(sessionId, (session) => ({
      ...session,
      files: {
        ...session.files,
        ...nextFiles,
      },
      updatedAt: Date.now(),
    }));
  }

  function updateFile(path: string, content: string) {
    if (!activeSession) return;

    patchSession(activeSession.id, (session) => ({
      ...session,
      files: {
        ...session.files,
        [path]: content,
      },
      updatedAt: Date.now(),
    }));
  }

  function syncPreviewFromChat() {
    if (!activeSession) return;

    const lastAssistant = [...activeSession.messages]
      .reverse()
      .find((message) => message.role === "assistant" && message.content.trim());

    if (!lastAssistant) return;

    const parsed = parseGeneratedFiles(lastAssistant.content);
    mergeFiles(activeSession.id, parsed);
    return Object.keys(parsed).length;
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

    const visibleConversation: Message[] = [
      ...activeSession.messages,
      userMessage,
    ];
    const shouldRename = activeSession.title === "New chat";

    patchSession(sessionId, (session) => ({
      ...session,
      title: shouldRename ? titleFromMessage(content) : session.title,
      messages: [...visibleConversation, assistantMessage],
      updatedAt: Date.now(),
    }));

    setIsLoading(true);

    try {
      let response = "";
      let lastClosedFences = 0;
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const stream = chatService.generateStream({
        messages: buildMessagesWithContext(
          visibleConversation,
          activeSession.files
        ),
        signal: abortController.signal,
      });

      for await (const chunk of stream) {
        response += chunk;
        updateLastMessage(sessionId, response);

        // Only push files to preview when a full code fence closes
        const closedFences = response.split("```").length - 1;
        if (closedFences >= 2 && closedFences > lastClosedFences && closedFences % 2 === 0) {
          lastClosedFences = closedFences;
          const partialFiles = parseGeneratedFiles(response);
          if (Object.keys(partialFiles).length) {
            mergeFiles(sessionId, partialFiles);
          }
        }
      }

      const finalFiles = parseGeneratedFiles(response);
      mergeFiles(sessionId, finalFiles);

      if (!Object.keys(finalFiles).length) {
        console.warn(
          "No project files parsed from AI response. Preview will not update."
        );
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
    files,
    isLoading,
    sendMessage,
    stopGeneration,
    createChat,
    selectChat,
    deleteChat,
    updateFile,
    syncPreviewFromChat,
  };
}
