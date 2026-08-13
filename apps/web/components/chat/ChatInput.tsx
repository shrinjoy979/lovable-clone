"use client";

import { useState } from "react";
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

  function handleSend() {
    if (!message.trim()) return;
    onSend(message);
    setMessage("");
  }

  return (
    <div className="flex gap-3">
      <Textarea
        value={message}
        disabled={isLoading}
        onChange={(e) =>
          setMessage(e.target.value)
        }
        placeholder="Ask anything..."
      />

      <Button
        onClick={isLoading ? onStop : handleSend}
      >
        {isLoading ? "Stop" : "Send"}
      </Button>
    </div>
  );
}