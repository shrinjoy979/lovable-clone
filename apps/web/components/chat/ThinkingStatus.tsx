"use client";

import { useEffect, useState } from "react";

const STATUSES = [
  "Thinking",
  "Gathering information",
  "Looking through the request",
  "Almost there",
  "Drafting a plan",
  "Writing the code",
  "Putting it together",
  "Polishing the details",
];

export default function ThinkingStatus() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % STATUSES.length);
    }, 1800);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <p className="thinking-status" aria-live="polite" aria-label={STATUSES[index]}>
      <span key={index} className="thinking-status-text">
        {STATUSES[index]}
      </span>
      <span className="thinking-ellipsis" aria-hidden>
        <span>.</span>
        <span>.</span>
        <span>.</span>
      </span>
    </p>
  );
}
