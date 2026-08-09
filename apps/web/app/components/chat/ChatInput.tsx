"use client";

import { useState } from "react";
import { Button, Textarea } from "@repo/ui";

interface ChatInputProps {
  onSend(message: string): void;
}

export default function ChatInput({
  onSend,
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
        onChange={(e) =>
          setMessage(e.target.value)
        }
        placeholder="Ask anything..."
      />

      <Button onClick={handleSend}>
        Send
      </Button>
    </div>
  );
}