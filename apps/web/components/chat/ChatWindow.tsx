"use client";

import ChatInput from "./ChatInput";
import ChatMessages from "./ChatMessages";
import { useChat } from "../../hooks/useChat";

export default function ChatWindow() {
  const { messages, sendMessage, stopGeneration, isLoading } = useChat();

  return (
    <div className="chat-shell">
      <header className="chat-header">
        <div className="chat-brand">
          <span className="chat-brand-mark">L</span>
          <span>Lovable</span>
        </div>
        <div className="chat-header-meta">
          {isLoading ? "Generating…" : "Ready"}
        </div>
      </header>

      <div className="chat-main">
        <div className="chat-messages">
          <ChatMessages messages={messages} isLoading={isLoading} />
        </div>

        <div className="chat-composer">
          <ChatInput
            onSend={sendMessage}
            onStop={stopGeneration}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
