"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRecognitionCtor = new () => {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0?: { transcript?: string };
  }>;
};

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useSpeechToText() {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<InstanceType<SpeechRecognitionCtor> | null>(
    null
  );
  const shouldListenRef = useRef(false);
  const finalRef = useRef("");

  useEffect(() => {
    setSupported(Boolean(getSpeechRecognitionCtor()));
  }, []);

  const stop = useCallback(() => {
    shouldListenRef.current = false;
    setListening(false);
    const recognition = recognitionRef.current;
    if (!recognition) return;
    recognition.onresult = null;
    recognition.onend = null;
    recognition.onerror = null;
    try {
      recognition.stop();
    } catch {
      try {
        recognition.abort();
      } catch {
        // ignore
      }
    }
  }, []);

  const start = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setError("Voice input is not supported in this browser. Try Chrome.");
      return;
    }

    stop();
    finalRef.current = "";
    setTranscript("");
    setError(null);
    shouldListenRef.current = true;
    setListening(true);

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang =
      typeof navigator !== "undefined" ? navigator.language || "en-US" : "en-US";
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      let interim = "";
      let finals = finalRef.current;

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (!result) continue;
        const piece = result[0]?.transcript ?? "";
        if (!piece) continue;
        if (result.isFinal) {
          finals = `${finals} ${piece}`.replace(/\s+/g, " ").trim();
        } else {
          interim += piece;
        }
      }

      finalRef.current = finals;
      const next = `${finals} ${interim}`.replace(/\s+/g, " ").trim();
      setTranscript(next);
    };

    recognition.onerror = (event) => {
      if (event.error === "no-speech" || event.error === "aborted") return;
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setError("Microphone permission denied. Allow access and try again.");
        shouldListenRef.current = false;
        setListening(false);
        return;
      }
      if (event.error === "network") {
        setError("Speech service unavailable. Check your connection and try Chrome.");
        shouldListenRef.current = false;
        setListening(false);
      }
    };

    recognition.onend = () => {
      if (!shouldListenRef.current) {
        setListening(false);
        return;
      }
      // Safari often stops after one utterance; restart so dictation stays live.
      try {
        recognition.start();
        setListening(true);
      } catch {
        window.setTimeout(() => {
          if (!shouldListenRef.current) return;
          try {
            recognition.start();
            setListening(true);
          } catch {
            shouldListenRef.current = false;
            setListening(false);
          }
        }, 200);
      }
    };

    try {
      recognition.start();
    } catch {
      setError("Could not start the microphone. Allow access and try again.");
      shouldListenRef.current = false;
      setListening(false);
    }
  }, [stop]);

  const reset = useCallback(() => {
    finalRef.current = "";
    setTranscript("");
  }, []);

  useEffect(() => {
    return () => {
      shouldListenRef.current = false;
      try {
        recognitionRef.current?.abort();
      } catch {
        // ignore
      }
    };
  }, []);

  return {
    supported,
    listening,
    transcript,
    error,
    start,
    stop,
    reset,
  };
}
