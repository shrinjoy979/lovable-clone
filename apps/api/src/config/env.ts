import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { z } from "zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),

  AI_PROVIDER: z.enum(["gemini", "openai"]).default("gemini"),

  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),

  OPENAI_API_KEY: z.string().optional(),

  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables");
  console.error(parsedEnv.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsedEnv.data;
