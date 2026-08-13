import type { Message } from "@repo/shared/chat";
import ChatMessage from "./ChatMessage";
import { useAutoScroll } from "../../hooks/useAutoScroll";

interface ChatMessagesProps {
  messages: Message[];
  isLoading?: boolean;
}

export default function ChatMessages({
  messages,
  isLoading = false,
}: ChatMessagesProps) {
  const bottomRef = useAutoScroll(messages);

  return (
    <>
      <div className="flex flex-col">
        {messages.map((message, index) => {
          const isLast = index === messages.length - 1;
          const isStreaming =
            isLoading && isLast && message.role === "assistant";

          return (
            <ChatMessage
              key={index}
              message={message}
              isStreaming={isStreaming}
            />
          );
        })}
      </div>

      <div ref={bottomRef} />
    </>
  );
}
