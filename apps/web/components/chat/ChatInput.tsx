"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { ArrowUp, Square } from "lucide-react";
import { Button, Textarea } from "@repo/ui";

interface ChatInputProps {
  onSend(message: string): void;
  onStop: () => void;
  isLoading: boolean;
}

export default function ChatInput({
  onSend,
  onStop,
  isLoading,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [message]);

  function handleSend() {
    if (!message.trim() || isLoading) return;
    onSend(message.trim());
    setMessage("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      <div className="chat-composer-box">
        <Textarea
          ref={textareaRef}
          value={message}
          disabled={isLoading}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Lovable to build anything…"
          rows={1}
          className="min-h-[44px] max-h-[180px] flex-1 resize-none border-0 bg-transparent px-2 py-2.5 shadow-none outline-none focus:ring-0"
        />

        <Button
          type="button"
          size="sm"
          onClick={isLoading ? onStop : handleSend}
          disabled={!isLoading && !message.trim()}
          aria-label={isLoading ? "Stop generating" : "Send message"}
          className="mb-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full p-0"
        >
          {isLoading ? <Square size={14} fill="currentColor" /> : <ArrowUp size={16} />}
        </Button>
      </div>

      <p className="chat-composer-hint">
        Enter to send · Shift + Enter for a new line
      </p>
    </>
  );
}
