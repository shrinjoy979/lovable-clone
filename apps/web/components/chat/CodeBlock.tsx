"use client";

import {
  isValidElement,
  useState,
  type ReactNode,
} from "react";
import { Check, Copy } from "lucide-react";

function getText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(getText).join("");
  }

  if (isValidElement<{ children?: ReactNode }>(node)) {
    return getText(node.props.children);
  }

  return "";
}

function getLanguage(node: ReactNode): string {
  if (!isValidElement<{ className?: string }>(node)) {
    return "";
  }

  const match = /language-([\w-]+)/.exec(node.props.className ?? "");
  return match?.[1] ?? "";
}

interface CodeBlockProps {
  children?: ReactNode;
}

export default function CodeBlock({ children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const code = getText(children).replace(/\n$/, "");
  const language = getLanguage(children);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy code", error);
    }
  }

  return (
    <div className="code-block">
      <div className="code-block-header">
        <span className="code-block-lang">{language || "code"}</span>
        <button
          type="button"
          className="code-block-copy"
          onClick={handleCopy}
          aria-label={copied ? "Copied" : "Copy code"}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}
