"use client";

import { useEffect, useState } from "react";

export function useTypingPlaceholder(text: string, enabled: boolean) {
  const [shown, setShown] = useState("");

  useEffect(() => {
    if (!enabled) {
      setShown("");
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(text);
      return;
    }

    let index = 0;
    let deleting = false;
    let timer = 0;

    const tick = () => {
      if (!deleting) {
        index += 1;
        setShown(text.slice(0, index));
        if (index >= text.length) {
          deleting = true;
          timer = window.setTimeout(tick, 1800);
          return;
        }
        timer = window.setTimeout(tick, 58);
        return;
      }

      index -= 1;
      setShown(text.slice(0, Math.max(index, 0)));
      if (index <= 0) {
        deleting = false;
        timer = window.setTimeout(tick, 420);
        return;
      }
      timer = window.setTimeout(tick, 28);
    };

    timer = window.setTimeout(tick, 280);

    return () => window.clearTimeout(timer);
  }, [enabled, text]);

  return shown;
}
