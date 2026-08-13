import type { ProjectFiles } from "../types/chat";

const LANGUAGE_FILE_MAP: Record<string, string> = {
  html: "index.html",
  htm: "index.html",
  css: "styles.css",
  js: "script.js",
  javascript: "script.js",
  ts: "script.js",
  typescript: "script.js",
};

function resolvePath(info: string): string | null {
  const trimmed = info.trim().replace(/^filepath:/i, "file:");

  if (!trimmed || trimmed === "plaintext" || trimmed === "text") {
    return null;
  }

  if (/^file:/i.test(trimmed)) {
    return trimmed.replace(/^file:/i, "").trim().replace(/^\.\//, "") || null;
  }

  if (/^file\s+/i.test(trimmed)) {
    return trimmed.replace(/^file\s+/i, "").trim().replace(/^\.\//, "") || null;
  }

  const pathMatch = trimmed.match(
    /(?:path|file)\s*=\s*["']?([^"'\s]+)["']?/i
  );
  if (pathMatch?.[1]) {
    return pathMatch[1].replace(/^\.\//, "");
  }

  const langWithPath = trimmed.match(/^(\w+)\s*:\s*(.+\.\w+)\s*$/);
  if (langWithPath?.[2]) {
    return langWithPath[2].replace(/^\.\//, "");
  }

  const language = trimmed.split(/[\s:{]/)[0]?.toLowerCase() ?? "";
  return LANGUAGE_FILE_MAP[language] ?? null;
}

function inferPathFromContent(body: string): string | null {
  const trimmed = body.trim();

  if (/<!doctype html|<html[\s>]/i.test(trimmed)) {
    return "index.html";
  }

  if (
    /[{;]/.test(trimmed) &&
    /(color|background|margin|padding|font-|display|flex|grid|border)/i.test(
      trimmed
    )
  ) {
    return "styles.css";
  }

  if (
    /(document\.|addEventListener|querySelector|function|const |let |=>)/.test(
      trimmed
    )
  ) {
    return "script.js";
  }

  return null;
}

function collectFence(
  files: ProjectFiles,
  info: string,
  body: string
) {
  const cleaned = body.replace(/\n$/, "");
  if (!cleaned.trim()) return;

  const path = resolvePath(info) ?? inferPathFromContent(cleaned);
  if (!path) return;

  files[path] = cleaned;
}

/**
 * Extracts project files from AI markdown fences and raw HTML.
 */
export function parseGeneratedFiles(content: string): ProjectFiles {
  const files: ProjectFiles = {};
  const pattern = /```([^\n`]*)\n([\s\S]*?)```/g;

  for (const match of content.matchAll(pattern)) {
    collectFence(files, match[1] ?? "", match[2] ?? "");
  }

  // Unclosed trailing fence (common while streaming)
  const unclosed = content.match(/```([^\n`]*)\n([\s\S]*)$/);
  if (unclosed && !content.trimEnd().endsWith("```")) {
    collectFence(files, unclosed[1] ?? "", unclosed[2] ?? "");
  }

  if (!files["index.html"]) {
    const rawHtml = content.match(/<!DOCTYPE html[\s\S]*?<\/html>/i)?.[0];
    if (rawHtml) {
      files["index.html"] = rawHtml;
    }
  }

  return files;
}
