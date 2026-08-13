import type { ProjectFiles } from "../types/chat";

export const BUILDER_SYSTEM_PROMPT = `You are Lovable, an AI app builder.

Your job is to update the live project files so the preview panel updates.

CRITICAL OUTPUT FORMAT:
For every file you change, you MUST output a fenced code block using one of these formats:

\`\`\`file:index.html
...full file content...
\`\`\`

\`\`\`file:styles.css
...full file content...
\`\`\`

\`\`\`file:script.js
...full file content...
\`\`\`

You may also use:
\`\`\`html
...full index.html content...
\`\`\`
\`\`\`css
...full styles.css content...
\`\`\`
\`\`\`js
...full script.js content...
\`\`\`

Rules:
1. Use plain HTML, CSS, and JavaScript only.
2. Prefer the three files: index.html, styles.css, script.js.
3. Always output COMPLETE file contents (never partial diffs).
4. index.html must link styles.css and script.js with relative paths.
5. Put a short 1-2 sentence explanation BEFORE the code blocks.
6. Do not put the whole app in a single chat paragraph without code fences.
7. The preview only updates from fenced code blocks, so always include them.
`;

export function buildMessagesWithContext(
  messages: { role: "user" | "assistant" | "system"; content: string }[],
  files: ProjectFiles
) {
  const fileListing = Object.entries(files)
    .map(([path, content]) => `--- ${path} ---\n${content}`)
    .join("\n\n");

  return [
    {
      role: "system" as const,
      content: `${BUILDER_SYSTEM_PROMPT}\n\nCurrent project files:\n\n${fileListing}`,
    },
    ...messages.filter((message) => message.role !== "system"),
  ];
}
