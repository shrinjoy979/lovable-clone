import type { Message } from "@repo/shared/chat";

export type ProjectFiles = Record<string, string>;

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  files: ProjectFiles;
  updatedAt: number;
}

export const DEFAULT_FILES: ProjectFiles = {
  "index.html": `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Lovable App</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <main class="app">
      <h1>Your app starts here</h1>
      <p>Describe what you want to build in the chat.</p>
      <button id="action">Click me</button>
    </main>
    <script src="script.js"></script>
  </body>
</html>
`,
  "styles.css": `:root {
  font-family: Inter, system-ui, sans-serif;
  color: #171717;
  background: #f7f7f5;
}

body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
}

.app {
  text-align: center;
  padding: 2rem;
}

h1 {
  margin: 0 0 0.5rem;
  letter-spacing: -0.03em;
}

p {
  color: #737373;
}

button {
  margin-top: 1rem;
  border: none;
  border-radius: 999px;
  background: #171717;
  color: white;
  padding: 0.7rem 1.2rem;
  cursor: pointer;
}
`,
  "script.js": `const button = document.getElementById("action");

button?.addEventListener("click", () => {
  button.textContent = "It works!";
});
`,
};

export const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content:
    "Hi! Describe an app or UI and I’ll generate the files for you. You’ll see them in the explorer and live preview on the right.",
};

export function createChatSession(): ChatSession {
  return {
    id: crypto.randomUUID(),
    title: "New chat",
    messages: [WELCOME_MESSAGE],
    files: { ...DEFAULT_FILES },
    updatedAt: Date.now(),
  };
}

export function titleFromMessage(content: string): string {
  const cleaned = content.trim().replace(/\s+/g, " ");
  if (!cleaned) return "New chat";
  return cleaned.length > 42 ? `${cleaned.slice(0, 42)}…` : cleaned;
}

export function normalizeSession(session: ChatSession): ChatSession {
  return {
    ...session,
    files: session.files && Object.keys(session.files).length
      ? session.files
      : { ...DEFAULT_FILES },
  };
}
