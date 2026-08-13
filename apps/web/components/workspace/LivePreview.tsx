"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ProjectFiles } from "../../types/chat";
import { buildPreviewHtml } from "../../lib/preview";

interface LivePreviewProps {
  files: ProjectFiles;
  isUpdating?: boolean;
}

export default function LivePreview({
  files,
  isUpdating = false,
}: LivePreviewProps) {
  const nextHtml = useMemo(() => buildPreviewHtml(files), [files]);
  const [front, setFront] = useState<0 | 1>(0);
  const [sources, setSources] = useState<[string, string]>([
    nextHtml,
    nextHtml,
  ]);
  const [frameKeys, setFrameKeys] = useState<[number, number]>([0, 0]);
  const pendingRef = useRef<{ slot: 0 | 1; html: string } | null>(null);
  const displayedHtmlRef = useRef(nextHtml);

  useEffect(() => {
    if (nextHtml === displayedHtmlRef.current) return;

    const delay = isUpdating ? 850 : 160;
    const timer = window.setTimeout(() => {
      if (nextHtml === displayedHtmlRef.current) return;

      const slot: 0 | 1 = front === 0 ? 1 : 0;
      pendingRef.current = { slot, html: nextHtml };

      setSources((prev) => {
        const next = [...prev] as [string, string];
        next[slot] = nextHtml;
        return next;
      });
      setFrameKeys((prev) => {
        const next = [...prev] as [number, number];
        next[slot] = prev[slot] + 1;
        return next;
      });
    }, delay);

    return () => window.clearTimeout(timer);
  }, [nextHtml, isUpdating, front]);

  function handleLoad(slot: 0 | 1) {
    const pending = pendingRef.current;
    if (!pending || pending.slot !== slot) return;

    displayedHtmlRef.current = pending.html;
    pendingRef.current = null;
    setFront(slot);
  }

  return (
    <div className={`live-preview ${isUpdating ? "is-updating" : ""}`}>
      <iframe
        key={`preview-a-${frameKeys[0]}`}
        title="Live preview A"
        className={`live-preview-frame ${front === 0 ? "is-front" : "is-back"}`}
        sandbox="allow-scripts"
        srcDoc={sources[0]}
        onLoad={() => handleLoad(0)}
      />
      <iframe
        key={`preview-b-${frameKeys[1]}`}
        title="Live preview B"
        className={`live-preview-frame ${front === 1 ? "is-front" : "is-back"}`}
        sandbox="allow-scripts"
        srcDoc={sources[1]}
        onLoad={() => handleLoad(1)}
      />

      {isUpdating ? (
        <div className="live-preview-status">Updating preview…</div>
      ) : null}
    </div>
  );
}
