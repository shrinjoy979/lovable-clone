"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { ArrowUp, ChevronDown, Mic, Sparkles, Square } from "lucide-react";
import { Textarea } from "@repo/ui";
import {
  DEFAULT_GEMINI_MODEL,
  GEMINI_MODELS,
  modelRequiresApiKey,
  type GeminiModelId,
} from "@repo/shared/chat";
import { useSpeechToText } from "../../hooks/useSpeechToText";
import { useTypingPlaceholder } from "../../hooks/useTypingPlaceholder";
import {
  hasGeminiApiKey,
  readGeminiApiKey,
  saveGeminiApiKey,
} from "../../lib/gemini-api-key";
import ApiKeyModal from "./ApiKeyModal";

const MODEL_STORAGE_KEY = "lovable-clone:model";
const IDLE_PLACEHOLDER = "Describe an app to build…";

interface ChatInputProps {
  onSend(message: string, model: GeminiModelId, apiKey?: string): void;
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
  const [hasApiKey, setHasApiKey] = useState(false);
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [pendingModel, setPendingModel] = useState<GeminiModelId | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typedRef = useRef("");
  const pickerRef = useRef<HTMLDivElement>(null);

  const { supported, listening, transcript, error, start, stop, reset } =
    useSpeechToText();

  const message = [typed, transcript].filter(Boolean).join(" ").trimStart();
  const showTypingPlaceholder = !listening && !isLoading && !message.trim();
  const typingPlaceholder = useTypingPlaceholder(
    IDLE_PLACEHOLDER,
    showTypingPlaceholder
  );
  const selectedModel =
    GEMINI_MODELS.find((option) => option.id === model) ?? GEMINI_MODELS[0];

  useEffect(() => {
    const stored = window.localStorage.getItem(MODEL_STORAGE_KEY);
    if (stored && isGeminiModelId(stored)) {
      setModel(stored);
    }
    setHasApiKey(hasGeminiApiKey());
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

  function selectModel(value: GeminiModelId) {
    setModel(value);
    window.localStorage.setItem(MODEL_STORAGE_KEY, value);
    setModelOpen(false);
  }

  function handleSend() {
    const text = message.trim();
    if (!text || isLoading) return;
    if (modelRequiresApiKey(model) && !hasGeminiApiKey()) {
      setPendingModel(model);
      setKeyModalOpen(true);
      return;
    }
    if (listening) stop();
    onSend(
      text,
      model,
      modelRequiresApiKey(model) ? readGeminiApiKey() : undefined
    );
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
    if (modelRequiresApiKey(value) && !hasGeminiApiKey()) {
      setPendingModel(value);
      setModelOpen(false);
      setKeyModalOpen(true);
      return;
    }

    selectModel(value);
  }

  function handleSaveApiKey(apiKey: string) {
    saveGeminiApiKey(apiKey);
    setHasApiKey(true);
    setKeyModalOpen(false);
    if (pendingModel) {
      selectModel(pendingModel);
      setPendingModel(null);
    }
  }

  return (
    <>
      <div className="chat-composer-box">
        <div className="chat-composer-main">
          <div className="chat-composer-field">
            <Textarea
              ref={textareaRef}
              value={message}
              disabled={isLoading}
              onChange={(e) => {
                if (listening) return;
                setTyped(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              placeholder=""
              rows={1}
              aria-label={
                listening ? "Listening… speak now" : IDLE_PLACEHOLDER
              }
              className="min-h-[44px] max-h-[180px] flex-1 resize-none border-0 bg-transparent px-2 py-2.5 text-[0.97rem] leading-6 text-[var(--fg)] placeholder:text-[var(--fg-muted)] shadow-none outline-none focus:ring-0"
            />
            {!message ? (
              <span className="chat-composer-placeholder" aria-hidden>
                {listening ? "Listening… speak now" : typingPlaceholder}
                {showTypingPlaceholder ? (
                  <span className="chat-composer-caret" />
                ) : null}
              </span>
            ) : null}
          </div>

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
                {GEMINI_MODELS.map((option) => {
                  const selected = option.id === model;
                  const needsKey = option.requiresApiKey && !hasApiKey;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      className={`chat-model-option ${
                        selected ? "is-active" : ""
                      } ${needsKey ? "is-locked" : ""}`}
                      onClick={() => handleModelChange(option.id)}
                    >
                      <span className="chat-model-option-label">
                        {option.label}
                      </span>
                      {selected ? (
                        <span className="chat-model-status">on</span>
                      ) : needsKey ? (
                        <span className="chat-model-status">
                          need your API key
                        </span>
                      ) : option.requiresApiKey ? (
                        <span className="chat-model-status">ready</span>
                      ) : (
                        <span className="chat-model-badge">FREE</span>
                      )}
                    </button>
                  );
                })}
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

      <ApiKeyModal
        open={keyModalOpen}
        onClose={() => {
          setKeyModalOpen(false);
          setPendingModel(null);
        }}
        onSave={handleSaveApiKey}
      />
    </>
  );
}
