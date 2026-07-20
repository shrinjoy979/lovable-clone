import type { GenerateOptions } from "@repo/shared/chat";

export interface AIProvider {
  generate(options: GenerateOptions): Promise<string>;

  generateStream(options: GenerateOptions): AsyncGenerator<string>;
}
