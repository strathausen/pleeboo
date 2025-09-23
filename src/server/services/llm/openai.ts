import { env } from "@/env";
import OpenAI from "openai";

/**
 * Singleton OpenAI client instance
 * Returns null if API key is not configured
 */
export function getOpenAIClient(): OpenAI | null {
  if (!env.OPENAI_API_KEY) {
    return null;
  }

  return new OpenAI({
    apiKey: env.OPENAI_API_KEY,
  });
}

/**
 * Helper to check if OpenAI is configured
 */
export function isOpenAIConfigured(): boolean {
  return !!env.OPENAI_API_KEY;
}
