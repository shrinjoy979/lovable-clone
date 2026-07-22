# AI Chat Backend

A production-style AI chat backend built with **Node.js**, **Express**, **TypeScript**, and a clean layered architecture. The project supports multiple AI providers through a provider abstraction and includes real-time streaming responses using **Server-Sent Events (SSE)**.

## Features

* 🚀 TypeScript + Express
* 🤖 Multiple AI providers (Gemini & OpenAI)
* 🏗️ Provider Pattern & Factory Pattern
* 📦 Shared request/response types
* ✅ Request validation using Zod
* 🌊 Real-time streaming responses with Server-Sent Events (SSE)
* ⛔ Request cancellation using `AbortController`
* 🧩 Clean layered architecture
* 🔄 Easy to extend with additional AI providers

---

# Tech Stack

* Node.js
* Express
* TypeScript
* Zod
* Google Gemini API
* OpenAI API
* Server-Sent Events (SSE)

---

# Project Structure

```text
src
├── app.ts
├── index.ts
├── config
├── controllers
│   └── chat.controller.ts
├── middleware
├── providers
│   ├── ai-provider.interface.ts
│   ├── gemini.provider.ts
│   ├── openai.provider.ts
│   └── provider.factory.ts
├── routes
│   └── chat.routes.ts
├── services
│   └── chat.service.ts
├── validations
│   └── chat.validation.ts
└── types
```

---

# Architecture

```text
               HTTP Request
                     │
                     ▼
               Express Router
                     │
                     ▼
               Chat Controller
                     │
                     ▼
                Chat Service
                     │
                     ▼
              Provider Factory
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
   Gemini Provider      OpenAI Provider
          │                     │
          └──────────┬──────────┘
                     ▼
                AI Provider API
```

---

# Streaming Architecture

```text
Browser
    │
fetch("/chat/stream")
    │
    ▼
Express Controller
    │
    ▼
Chat Service
    │
    ▼
Gemini/OpenAI Provider
    │
    ▼
AsyncGenerator<string>
    │
    ▼
Server-Sent Events (SSE)
    │
    ▼
Browser receives chunks in real time
```

---

# Design Patterns Used

## Provider Pattern

Each AI model implements the same interface.

```ts
interface AIProvider {
    generate(options: GenerateOptions): Promise<string>;

    generateStream(
        options: GenerateOptions
    ): AsyncGenerator<string>;
}
```

Supported providers:

* Gemini
* OpenAI

Adding a new provider only requires implementing the interface.

---

## Factory Pattern

The provider is selected at runtime using an environment variable.

```text
AI_PROVIDER=gemini
```

or

```text
AI_PROVIDER=openai
```

---

## Layered Architecture

```text
Route
    ↓
Controller
    ↓
Service
    ↓
Provider
    ↓
AI SDK
```

Each layer has a single responsibility.

### Routes

* Define API endpoints.

### Controllers

* Handle HTTP requests and responses.
* Validate input.
* Stream SSE responses.

### Services

* Coordinate business logic.
* Delegate AI generation to the selected provider.

### Providers

* Communicate with external AI SDKs.
* Convert application messages into provider-specific formats.
* Support both standard and streaming responses.

---

# API Endpoints

## Generate Response

```http
POST /chat
```

### Request

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Explain React Hooks."
    }
  ]
}
```

### Response

```json
{
  "response": "React Hooks are..."
}
```

---

## Stream Response

```http
POST /chat/stream
```

Response uses **Server-Sent Events (SSE)**.

Example stream:

```text
data: React

data: Hooks

data: allow...

```

---

# Validation

All requests are validated using **Zod** before reaching the service layer.

Rules include:

* At least one message is required
* Supported roles:

  * user
  * assistant
  * system
* Content cannot be empty
* Maximum content length: 5000 characters

---

# Streaming

Streaming responses are implemented using:

* AsyncGenerator
* Server-Sent Events (SSE)
* AbortController
* Readable Streams

If the client disconnects:

1. Express detects the connection close.
2. `AbortController` aborts the request.
3. The AI provider stops generating tokens.
4. Resources are cleaned up automatically.

---

# Environment Variables

Create a `.env` file.

```env
PORT=3001

AI_PROVIDER=gemini

GEMINI_API_KEY=your_gemini_api_key

OPENAI_API_KEY=your_openai_api_key
```

---

# Run Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The server will start on:

```text
http://localhost:3001
```

---

# Future Improvements

* Conversation persistence
* Authentication
* Rate limiting
* Request logging
* Metrics & monitoring
* Unit tests
* Docker support
* Redis caching
* Conversation memory
* Model configuration per request
* Tool calling / Function calling
* Image generation support
* File uploads

---

# Learning Objectives

This project demonstrates practical implementation of:

* Express.js
* TypeScript
* Clean Architecture
* Layered Architecture
* Provider Pattern
* Factory Pattern
* AsyncGenerator
* Server-Sent Events (SSE)
* AbortController
* Streaming APIs
* Zod Validation
* AI SDK Integration

---

# License

This project is intended for educational purposes and experimentation with modern AI application architecture.
