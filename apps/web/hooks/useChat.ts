"use client";

import { useRef, useState } from "react";

import type { Message } from "@repo/shared/chat";

import chatService from "../services/chat.service";

export function useChat() {
    const [isLoading, setIsLoading] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);
    const [messages, setMessages] = useState<Message[]>([
        {
        role: "assistant",
        content: "Hello! How can I help you today?",
        },
    ]);

  function updateLastMessage(content: string) {
    setMessages((prev) => {
      const updated = [...prev];

      const lastMessage = updated[updated.length - 1];

      if (!lastMessage) {
        return prev;
      }

      updated[updated.length - 1] = {
        ...lastMessage,
        content,
      };

      return updated;
    });
  }

  async function sendMessage(content: string) {
    const userMessage: Message = {
      role: "user",
      content,
    };

    const assistantMessage: Message = {
      role: "assistant",
      content: "",
    };

    const conversation: Message[] = [
      ...messages,
      userMessage,
    ];

    setMessages([
      ...conversation,
      assistantMessage,
    ]);

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
            updateLastMessage(response);
        }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        console.log("Generation stopped by user.");
      } else {
        console.error(error);
        updateLastMessage("Something went wrong.");
      }
    } finally {
        abortControllerRef.current = null;
        setIsLoading(false);
    }
  }

  function stopGeneration() {
    abortControllerRef.current?.abort();
  }

  return {
    messages,
    sendMessage,
    stopGeneration,
    isLoading,
  };
}
