"use client";

import { useState } from "react";

import type { Message } from "@repo/shared/chat";

import ChatInput from "./ChatInput";
import ChatMessages from "./ChatMessages";

import chatService from "@/services/chat.service";

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! How can I help you today!",
    },
  ]);

  async function handleSend(content: string) {
    const userMessage: Message = {
      role: "user",
      content,
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await chatService.generateResponse({
        messages: [...messages, userMessage],
      });

      const assistantMessage: Message = {
        role: "assistant",
        content: response,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong.",
        },
      ]);
    }
  }

  return (
    <div className="mx-auto flex h-screen max-w-4xl flex-col p-6">
      <div className="flex-1 overflow-y-auto">
        <ChatMessages messages={messages} />
      </div>

      <div className="mt-4">
        <ChatInput onSend={handleSend} />
      </div>
    </div>
  );
}