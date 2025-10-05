import { env } from "@/env";
import OpenAI from "openai";

/**
 * Singleton OpenAI client instance
 * Returns null if API key is not configured
 */
export function getOpenAIClient(): OpenAI | null {
  return new OpenAI({
    apiKey: env.OPENAI_API_KEY,
  });
}
