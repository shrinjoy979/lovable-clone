"use client";

import { useState } from "react";

import type { Message } from "@repo/shared/chat";

import chatService from "../services/chat.service";

export function useChat() {
    const [isLoading, setIsLoading] = useState(false);
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

      const stream = chatService.generateStream({
        messages: conversation,
      });

      for await (const chunk of stream) {
        response += chunk;
        updateLastMessage(response);
      }
    } catch (error) {
      console.error(error);
      updateLastMessage("Something went wrong.");
    } finally {
        setIsLoading(false);
    }
  }

  return {
    messages,
    sendMessage,
    isLoading,
  };
}
