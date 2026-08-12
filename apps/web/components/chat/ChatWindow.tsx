"use client";

import ChatInput from "./ChatInput";
import ChatMessages from "./ChatMessages";

import { useChat } from "../../hooks/useChat";

export default function ChatWindow() {
  const { messages, sendMessage } = useChat();

  return (
    <div className="mx-auto flex h-screen max-w-4xl flex-col p-6">
      <div className="flex-1 overflow-y-auto">
        <ChatMessages messages={messages} />
      </div>

      <div className="mt-4">
        <ChatInput onSend={sendMessage} />
      </div>
    </div>
  );
}