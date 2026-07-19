import type { Message } from "@repo/shared/chat";

export interface AIProvider {
  generate(messages: Message[]): Promise<string>;

  generateStream(messages: Message[]): AsyncGenerator<string>;
}
