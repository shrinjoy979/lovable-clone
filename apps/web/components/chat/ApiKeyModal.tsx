"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { isValidGeminiApiKeyFormat } from "@repo/shared/chat";
import chatService from "../../services/chat.service";

interface ApiKeyModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
}

export default function ApiKeyModal({
  open,
  onClose,
  onSave,
}: ApiKeyModalProps) {
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [apiKey, setApiKey] = useState("");
  const [mounted, setMounted] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setApiKey("");
      setError("");
      setChecking(false);
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !checking) onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, checking]);

  async function handleSave() {
    const next = apiKey.trim();
    if (!next || checking) return;

    if (!isValidGeminiApiKeyFormat(next)) {
      setError("Enter a valid Gemini API key from Google AI Studio");
      return;
    }

    setChecking(true);
    setError("");

    try {
      await chatService.validateApiKey(next);
      onSave(next);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "This API key is not valid"
      );
    } finally {
      setChecking(false);
    }
  }

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="api-key-overlay"
      onClick={() => {
        if (!checking) onClose();
      }}
    >
      <div
        className="api-key-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="api-key-close"
          aria-label="Close"
          disabled={checking}
          onClick={onClose}
        >
          <X size={16} />
        </button>

        <div className="api-key-header">
          <h2 id={titleId} className="api-key-title">
            Your API key
          </h2>
          <p className="api-key-copy">
            Unlocks Gemini 2.5 Pro. Flash works without one.
          </p>
        </div>

        <label className="api-key-label" htmlFor="gemini-api-key">
          API key
        </label>
        <input
          id="gemini-api-key"
          ref={inputRef}
          type="password"
          autoComplete="off"
          spellCheck={false}
          placeholder="AIza..."
          value={apiKey}
          disabled={checking}
          aria-invalid={Boolean(error)}
          onChange={(event) => {
            setApiKey(event.target.value);
            if (error) setError("");
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void handleSave();
            }
          }}
          className={`api-key-input ${error ? "is-invalid" : ""}`}
        />
        {error ? <p className="api-key-error">{error}</p> : null}

        <button
          type="button"
          className="api-key-save"
          disabled={!apiKey.trim() || checking}
          onClick={() => void handleSave()}
        >
          {checking ? "Checking key…" : "Save key"}
        </button>

        <p className="api-key-footer">
          Get one from{" "}
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noreferrer"
          >
            Google AI Studio
          </a>
          . It is stored in this browser and never shown again.
        </p>
      </div>
    </div>,
    document.body
  );
}
