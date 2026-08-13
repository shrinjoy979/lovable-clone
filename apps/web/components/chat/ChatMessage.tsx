import type { Message } from "@repo/shared/chat";
import ReactMarkdown from "react-markdown";
import CodeBlock from "./CodeBlock";

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

export default function ChatMessage({
  message,
  isStreaming = false,
}: ChatMessageProps) {
  const isUser = message.role === "user";
  const showTyping = isStreaming && !message.content.trim();

  return (
    <div className={`message-row ${isUser ? "is-user" : "is-assistant"}`}>
      <div className="message-stack">
        {!isUser && (
          <div className="message-avatar assistant" aria-hidden>
            AI
          </div>
        )}

        <div className={`message-bubble ${isUser ? "user" : "assistant"}`}>
          {isUser ? (
            message.content
          ) : showTyping ? (
            <div className="typing-dots" aria-label="Assistant is typing">
              <span />
              <span />
              <span />
            </div>
          ) : (
            <div className="markdown">
              <ReactMarkdown
                components={{
                  pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
                }}
              >
                {message.content}
              </ReactMarkdown>
              {isStreaming ? <span className="streaming-caret" /> : null}
            </div>
          )}
        </div>

        {isUser && (
          <div className="message-avatar user" aria-hidden>
            You
          </div>
        )}
      </div>
    </div>
  );
}
