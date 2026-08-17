"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { ArrowUp, Mic, Square } from "lucide-react";
import { Button, Textarea } from "@repo/ui";
import { useSpeechToText } from "../../hooks/useSpeechToText";

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
  const [typed, setTyped] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typedRef = useRef("");

  const { supported, listening, transcript, error, start, stop, reset } =
    useSpeechToText();

  const message = [typed, transcript].filter(Boolean).join(" ").trimStart();

  useEffect(() => {
    typedRef.current = typed;
  }, [typed]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [message]);

  useEffect(() => {
    if (isLoading && listening) stop();
  }, [isLoading, listening, stop]);

  function commitVoice() {
    const next = [typedRef.current, transcript]
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    setTyped(next);
    reset();
  }

  function toggleListening() {
    if (listening) {
      commitVoice();
      stop();
      return;
    }
    start();
  }

  function handleSend() {
    const text = message.trim();
    if (!text || isLoading) return;
    if (listening) stop();
    onSend(text);
    setTyped("");
    reset();
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
          onChange={(e) => {
            if (listening) return;
            setTyped(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            listening ? "Listening… speak now" : "Describe an app to build…"
          }
          rows={1}
          className="min-h-[44px] max-h-[180px] flex-1 resize-none border-0 bg-transparent px-2 py-2.5 shadow-none outline-none focus:ring-0"
        />

        {supported && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={toggleListening}
            disabled={isLoading}
            aria-label={listening ? "Stop voice input" : "Start voice input"}
            aria-pressed={listening}
            title={listening ? "Stop listening" : "Voice to text"}
            className={`mb-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full p-0 ${
              listening
                ? "bg-red-100 text-red-600 hover:bg-red-200"
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <Mic size={16} className={listening ? "animate-pulse" : undefined} />
          </Button>
        )}

        <Button
          type="button"
          size="sm"
          onClick={isLoading ? onStop : handleSend}
          disabled={!isLoading && !message.trim()}
          aria-label={isLoading ? "Stop generating" : "Send message"}
          className="mb-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full p-0"
        >
          {isLoading ? (
            <Square size={14} fill="currentColor" />
          ) : (
            <ArrowUp size={16} />
          )}
        </Button>
      </div>

      <p className="chat-composer-hint">
        {error
          ? error
          : listening
            ? "Listening… words appear as you speak"
            : `Enter to send · Shift + Enter for a new line${
                supported ? " · Mic for voice input" : ""
              }`}
      </p>
    </>
  );
}
