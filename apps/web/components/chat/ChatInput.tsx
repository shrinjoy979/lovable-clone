"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { ArrowUp, Check, ChevronDown, Mic, Sparkles, Square } from "lucide-react";
import { Textarea } from "@repo/ui";
import {
  DEFAULT_GEMINI_MODEL,
  GEMINI_MODELS,
  type GeminiModelId,
} from "@repo/shared/chat";
import { useSpeechToText } from "../../hooks/useSpeechToText";

const MODEL_STORAGE_KEY = "lovable-clone:model";

interface ChatInputProps {
  onSend(message: string, model: GeminiModelId): void;
  onStop: () => void;
  isLoading: boolean;
}

function isGeminiModelId(value: string): value is GeminiModelId {
  return GEMINI_MODELS.some((model) => model.id === value);
}

export default function ChatInput({
  onSend,
  onStop,
  isLoading,
}: ChatInputProps) {
  const [typed, setTyped] = useState("");
  const [model, setModel] = useState<GeminiModelId>(DEFAULT_GEMINI_MODEL);
  const [modelOpen, setModelOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typedRef = useRef("");
  const pickerRef = useRef<HTMLDivElement>(null);

  const { supported, listening, transcript, error, start, stop, reset } =
    useSpeechToText();

  const message = [typed, transcript].filter(Boolean).join(" ").trimStart();
  const selectedModel =
    GEMINI_MODELS.find((option) => option.id === model) ?? GEMINI_MODELS[0];

  useEffect(() => {
    const stored = window.localStorage.getItem(MODEL_STORAGE_KEY);
    if (stored && isGeminiModelId(stored)) {
      setModel(stored);
    }
  }, []);

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

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!pickerRef.current?.contains(event.target as Node)) {
        setModelOpen(false);
      }
    }

    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, []);

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
    onSend(text, model);
    setTyped("");
    reset();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  function handleModelChange(value: GeminiModelId) {
    setModel(value);
    window.localStorage.setItem(MODEL_STORAGE_KEY, value);
    setModelOpen(false);
  }

  return (
    <>
      <div className="chat-composer-box">
        <div className="chat-composer-main">
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
            className="min-h-[44px] max-h-[180px] flex-1 resize-none border-0 bg-transparent px-2 py-2.5 text-[0.97rem] leading-6 text-[var(--fg)] placeholder:text-[var(--fg-muted)] shadow-none outline-none focus:ring-0"
          />

          <div className="chat-composer-actions">
            {supported && (
              <button
                type="button"
                onClick={toggleListening}
                disabled={isLoading}
                aria-label={listening ? "Stop voice input" : "Start voice input"}
                aria-pressed={listening}
                title={listening ? "Stop listening" : "Voice to text"}
                className={`chat-icon-btn ${listening ? "is-listening" : ""}`}
              >
                <Mic size={16} className={listening ? "animate-pulse" : undefined} />
              </button>
            )}

            <button
              type="button"
              onClick={isLoading ? onStop : handleSend}
              disabled={!isLoading && !message.trim()}
              aria-label={isLoading ? "Stop generating" : "Send message"}
              className={`chat-send-btn ${isLoading ? "is-stop" : ""}`}
            >
              {isLoading ? (
                <Square size={13} fill="currentColor" />
              ) : (
                <ArrowUp size={16} />
              )}
            </button>
          </div>
        </div>

        <div className="chat-composer-tools">
          <div className="chat-model-picker" ref={pickerRef}>
            <button
              type="button"
              className="chat-model-trigger"
              disabled={isLoading}
              aria-haspopup="listbox"
              aria-expanded={modelOpen}
              aria-label="Select model"
              onClick={() => setModelOpen((open) => !open)}
            >
              <span className="chat-model-trigger-icon" aria-hidden>
                <Sparkles size={11} />
              </span>
              <span className="chat-model-trigger-label">
                {selectedModel?.label ?? "Gemini 2.5 Flash"}
              </span>
              <ChevronDown size={14} />
            </button>

            {modelOpen && (
              <div className="chat-model-menu" role="listbox">
                {GEMINI_MODELS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    role="option"
                    aria-selected={option.id === model}
                    className={`chat-model-option ${
                      option.id === model ? "is-active" : ""
                    }`}
                    onClick={() => handleModelChange(option.id)}
                  >
                    {option.label}
                    {option.id === model ? <Check size={14} /> : null}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
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
