"use client";

import { useState } from "react";

import type { Message } from "@repo/shared/chat";

import ChatInput from "./ChatInput";
import ChatMessages from "./ChatMessages";

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! How can I help you today?",
    },
  ]);

  function handleSend(content: string) {
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content,
      },
    ]);
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