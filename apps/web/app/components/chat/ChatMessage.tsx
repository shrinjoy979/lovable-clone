import type { Message } from "@repo/shared/chat";

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({
  message,
}: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex mb-4 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 ${
          isUser
            ? "bg-black text-white"
            : "bg-gray-100 text-black"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}