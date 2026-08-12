import type { Message } from "@repo/shared/chat";
import ChatMessage from "./ChatMessage";
import { useAutoScroll } from "../../hooks/useAutoScroll";

interface ChatMessagesProps {
  messages: Message[];
}

export default function ChatMessages({
  messages,
}: ChatMessagesProps) {
  const bottomRef = useAutoScroll(messages);

  return (
    <>
      <div className="flex flex-col gap-2">
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            message={message}
          />
        ))}
      </div>

      <div ref={bottomRef} />
    </>
  );
}