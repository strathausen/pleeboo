import { ALL_ICON_NAMES } from "@/lib/available-icons";
import {
  type BoardEvaluation,
  BoardEvaluationSchema,
} from "./llm/board-schemas";
import { instructorClient } from "./llm/instructor-client";

/**
 * Evaluates a board based on title, description, and prompt to suggest sections and items
 */
export async function evaluateBoard(params: {
  title: string;
  description?: string | null;
  prompt?: string | null;
}): Promise<BoardEvaluation | null> {
  // Check if OpenAI is configured
  if (!instructorClient) {
    console.log("[Board Evaluator] OpenAI not configured, skipping evaluation");
    return null;
  }

  // Combine all available information
  const parts: string[] = [];
  parts.push(`Event Title: ${params.title}`);
  if (params.description) parts.push(`Description: ${params.description}`);
  if (params.prompt) parts.push(`Additional Context: ${params.prompt}`);

  const content = parts.join("\n\n");

  try {
    console.log("[Board Evaluator] Starting evaluation for:", params.title);

    const result = await instructorClient.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert event planner helping to create a pledge board for community events.
Analyze ONLY the information explicitly provided by the user and suggest appropriate sections and items that volunteers can sign up for.

IMPORTANT RULES:
- Use ONLY information that is explicitly mentioned in the event title, description, or additional context
- Do NOT add assumptions, common practices, or typical needs unless they are directly stated
- Do NOT infer event type or typical requirements - work only with what's provided
- If information is minimal, provide minimal suggestions based strictly on what's given

For icons, use common Lucide icon names like:
${ALL_ICON_NAMES.join(", ")}

Provide practical, relevant suggestions based STRICTLY on the information provided.`,
        },
        {
          role: "user",
          content: `Create a pledge board structure for this event:\n\n${content}`,
        },
      ],
      model: "gpt-4o-mini",
      response_model: {
        schema: BoardEvaluationSchema,
        name: "BoardEvaluation",
      },
      max_tokens: 2000,
      temperature: 0.7,
    });

    const evaluation = result as BoardEvaluation;

    return evaluation;
  } catch (error) {
    console.error("[Board Evaluator] Evaluation failed:", error);
    return null;
  }
}
