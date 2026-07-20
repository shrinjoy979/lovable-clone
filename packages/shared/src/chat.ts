export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatRequest {
  messages: Message[];
}

export interface ChatResponse {
  response: string;
}

export interface GenerateOptions {
  messages: Message[];
  signal?: AbortSignal;
}
