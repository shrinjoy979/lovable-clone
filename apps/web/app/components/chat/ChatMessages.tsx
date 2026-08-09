import type { Message } from "@repo/shared/chat";
import ChatMessage from "./ChatMessage";

interface ChatMessagesProps {
  messages: Message[];
}

export default function ChatMessages({
  messages,
}: ChatMessagesProps) {
  return (
    <div className="flex flex-col gap-2">
      {messages.map((message, index) => (
        <ChatMessage
          key={index}
          message={message}
        />
      ))}
    </div>
  );
}