import { z } from "zod";

/**
 * Schema for individual pledge items that might be needed
 */
const PledgeItemSchema = z.object({
  title: z
    .string()
    .describe("Name of the item needed (e.g., 'Paper Plates', 'Grill Master')"),
  description: z
    .string()
    .optional()
    .describe("Additional details about the item"),
  icon: z
    .string()
    .describe("Icon name from Lucide icons that best represents this item"),
  quantity: z
    .number()
    .min(1)
    .max(100)
    .describe("Number of volunteers/items needed"),
  category: z.string().describe("Category this item belongs to"),
});

/**
 * Schema for pledge sections/categories
 */
const PledgeSectionSchema = z.object({
  title: z
    .string()
    .describe("Section title (e.g., 'Food & Drinks', 'Setup Crew')"),
  description: z.string().optional().describe("Section description"),
  icon: z.string().describe("Icon name from Lucide icons for this section"),
  items: z.array(PledgeItemSchema).describe("Items in this section"),
});

/**
 * Main board evaluation schema
 */
export const BoardEvaluationSchema = z.object({
  suggestedSections: z
    .array(PledgeSectionSchema)
    .describe("Suggested sections and items for the pledge board"),

  eventType: z
    .string()
    .describe(
      "Type of event detected (e.g., 'potluck', 'birthday party', 'community cleanup')",
    ),

  estimatedAttendees: z
    .number()
    .optional()
    .describe("Estimated number of attendees based on the description"),

  tips: z
    .array(z.string())
    .optional()
    .describe("Helpful tips for organizing this type of event"),

  timeline: z
    .object({
      setupTime: z
        .string()
        .optional()
        .describe("Suggested setup time before event"),
      eventDuration: z.string().optional().describe("Expected event duration"),
      cleanupTime: z.string().optional().describe("Estimated cleanup time"),
    })
    .optional()
    .describe("Suggested timeline for the event"),
});

/**
 * Type exports
 */
export type BoardEvaluation = z.infer<typeof BoardEvaluationSchema>;
export type PledgeSection = z.infer<typeof PledgeSectionSchema>;
export type PledgeItem = z.infer<typeof PledgeItemSchema>;
