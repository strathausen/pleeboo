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
Analyze the provided event information and suggest appropriate sections and items that volunteers can sign up for.

Consider:
- Type of event (potluck, birthday, community cleanup, etc.)
- Number of attendees (estimate if not specified)
- Common needs for this type of event
- Volunteer roles and responsibilities
- Items/supplies typically needed

For icons, use common Lucide icon names like:
- Food/Drinks: UtensilsCrossed, Coffee, Pizza, Cake, Wine
- Setup/Cleanup: Hammer, Trash, Broom, Package
- Activities: Music, GameController2, Camera, Megaphone
- Supplies: Package, ShoppingCart, Clipboard, Calendar
- People/Roles: Users, UserCheck, ChefHat, Car

Provide practical, relevant suggestions that make organizing easier.`,
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

    // Log the evaluation to console
    console.log("[Board Evaluator] Evaluation complete:", {
      title: params.title,
      eventType: evaluation.eventType,
      sectionsCount: evaluation.suggestedSections.length,
      totalItems: evaluation.suggestedSections.reduce(
        (acc, section) => acc + section.items.length,
        0,
      ),
    });

    console.log(
      "[Board Evaluator] Suggested sections:",
      JSON.stringify(evaluation.suggestedSections, null, 2),
    );

    if (evaluation.tips) {
      console.log("[Board Evaluator] Tips:", evaluation.tips);
    }

    if (evaluation.timeline) {
      console.log("[Board Evaluator] Timeline:", evaluation.timeline);
    }

    return evaluation;
  } catch (error) {
    console.error("[Board Evaluator] Evaluation failed:", error);
    return null;
  }
}
