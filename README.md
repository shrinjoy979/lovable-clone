# Lovable Clone

Build apps by chatting with AI — with live preview, file explorer, streaming chat, and downloadable codebases.

**Repo:** [github.com/shrinjoy979/lovable-clone](https://github.com/shrinjoy979/lovable-clone) · ⭐ Star on GitHub if you find it useful

This is an educational monorepo inspired by [Lovable](https://lovable.dev): describe a UI in chat, and the AI generates HTML/CSS/JS that updates a live preview.

---

## Features

### Frontend (`apps/web`)

- Streaming AI chat with markdown + copy-code blocks
- Polished chat UI (typing indicator, streaming caret)
- Chat / project history sidebar (create, switch, delete)
- File explorer + editable code viewer
- Live preview via sandboxed `iframe` + `srcDoc`
- Smooth preview crossfade while generating
- Open preview in a new tab
- Download codebase as ZIP
- Star on GitHub button in the sidebar

### Backend (`apps/api`)

- Express + TypeScript layered architecture
- Multiple AI providers (Gemini & OpenAI) via Provider + Factory patterns
- Real-time streaming with Server-Sent Events (SSE)
- Request cancellation with `AbortController`
- Zod request validation
- Shared types via `@repo/shared`

---

## Tech Stack

| Area | Stack |
|------|--------|
| Monorepo | pnpm workspaces + Turborepo |
| Web | Next.js 16, React 19, Tailwind CSS 4 |
| API | Node.js, Express 5, TypeScript |
| AI | Google Gemini (`@google/genai`), OpenAI |
| Streaming | SSE + `AsyncGenerator` |
| UI | `@repo/ui`, Lucide icons, `react-markdown` |

---

## Project Structure

```text
lovable-clone/
├── apps/
│   ├── api/                 # Express AI backend
│   │   └── src/
│   │       ├── controllers/
│   │       ├── providers/   # Gemini, OpenAI, factory
│   │       ├── routes/
│   │       ├── services/
│   │       └── validations/
│   └── web/                 # Next.js Lovable-style UI
│       ├── app/
│       ├── components/
│       │   ├── chat/
│       │   ├── layout/
│       │   └── workspace/   # Preview, files, code
│       ├── hooks/
│       ├── lib/
│       └── services/
└── packages/
    ├── shared/              # Shared chat types
    ├── ui/                  # Shared UI primitives
    ├── eslint-config/
    └── typescript-config/
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm 9

### 1. Install

```bash
pnpm install
```

### 2. Environment

**API** — create `apps/api/.env`:

```env
PORT=3001
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
FRONTEND_URL=http://localhost:3000
```

**Web** — create `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Run

```bash
pnpm dev
```

Or separately:

```bash
pnpm --filter api dev
pnpm --filter web dev
```

| App | URL |
|-----|-----|
| Web | http://localhost:3000 |
| API | http://localhost:3001 |
| Health | http://localhost:3001/health |

---

## How It Works

```text
User prompt
    │
    ▼
Next.js chat UI  ──SSE──►  Express /chat/stream
                                │
                                ▼
                         Provider Factory
                          (Gemini / OpenAI)
                                │
                                ▼
                    Stream tokens back to UI
                                │
                ┌───────────────┴───────────────┐
                ▼                               ▼
         Chat markdown                   Parse code fences
                                                │
                                                ▼
                                      Update project files
                                                │
                                                ▼
                                      Live iframe preview
```

1. You describe an app in chat.
2. The API streams the model response over SSE.
3. The web app parses code fences (`html` / `css` / `js` / `file:path`) into workspace files.
4. Preview builds a single HTML document and renders it in a sandboxed iframe.

---

## API Endpoints

### Generate response

```http
POST /chat
```

```json
{
  "messages": [
    { "role": "user", "content": "Build a landing page with a count button" }
  ]
}
```

### Stream response (SSE)

```http
POST /chat/stream
```

Chunks are JSON-encoded in `data:` events so newlines in code don’t break the stream.

### Health

```http
GET /health
```

---

## Design Patterns (API)

### Provider pattern

```ts
interface AIProvider {
  generate(options: GenerateOptions): Promise<string>;
  generateStream(options: GenerateOptions): AsyncGenerator<string>;
}
```

### Factory pattern

Select the provider with:

```env
AI_PROVIDER=gemini
# or
AI_PROVIDER=openai
```

### Layered architecture

```text
Route → Controller → Service → Provider → AI SDK
```

---

## Scripts

```bash
pnpm dev           # run all apps
pnpm build         # build all packages/apps
pnpm lint          # lint
pnpm check-types   # typecheck
```

---

## Deployment Notes

### API

- Deploy `apps/api` to a Node host (Railway, Render, Fly.io, etc.)
- Set the same env vars as local `.env`
- Set `FRONTEND_URL` to your deployed web origin (CORS)

### Web

- Deploy `apps/web` to Vercel (or similar)
- Set `NEXT_PUBLIC_API_URL` to your deployed API URL
- Build: `pnpm --filter web build`

### Share without hosting

Use **Download codebase** in the file explorer to get a ZIP of generated files, or **Open** to view the preview in a new tab.

---

## Future Improvements

- Auth & multi-user workspaces
- Persistent server-side project storage
- Rate limiting & request logging
- Docker Compose setup
- Stronger OpenAI streaming parity
- Tests (unit + e2e)

---

## License

Educational / experimental use. See repository for details.

---

If this helped you learn streaming AI apps or monorepo architecture, please [⭐ star the repo](https://github.com/shrinjoy979/lovable-clone).
