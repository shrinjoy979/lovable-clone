"use client";

import ChatInput from "./ChatInput";
import ChatMessages from "./ChatMessages";
import Sidebar from "../layout/Sidebar";
import { useChat } from "../../hooks/useChat";

export default function ChatWindow() {
  const {
    hydrated,
    sessions,
    activeId,
    messages,
    sendMessage,
    stopGeneration,
    isLoading,
    createChat,
    selectChat,
    deleteChat,
  } = useChat();

  return (
    <div className="chat-shell">
      <Sidebar
        sessions={hydrated ? sessions : []}
        activeId={activeId}
        onCreate={createChat}
        onSelect={selectChat}
        onDelete={deleteChat}
      />

      <div className="chat-panel">
        <header className="chat-header">
          <div className="chat-header-title">
            {hydrated
              ? sessions.find((session) => session.id === activeId)?.title ??
                "Chat"
              : "Chat"}
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
    </div>
  );
}
