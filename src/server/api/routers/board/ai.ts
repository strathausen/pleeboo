import { validateAdminToken } from "@/server/api/auth/board-auth";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { boardItems, boardSections, boards } from "@/server/db/schema";
import { evaluateBoard } from "@/server/services/board-evaluator";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { omit } from "lodash";
import { nanoid } from "nanoid";
import { z } from "zod";

export const boardAIRouter = createTRPCRouter({
  generateSuggestions: publicProcedure
    .input(
      z.object({
        boardId: z.string(),
        token: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Validate admin access - will throw if not admin
      await validateAdminToken(input.boardId, input.token || undefined);

      // Check if sections already exist
      const result = await ctx.db
        .select({ count: ctx.db.$count(boardSections) })
        .from(boardSections)
        .where(eq(boardSections.boardId, input.boardId));

      const count = result[0]?.count ?? 0;

      // If sections already exist, don't generate new ones
      if (count > 0) {
        return {
          success: false,
          message: "Board already has sections",
          sections: [],
        };
      }

      // Get the board details
      const board = await ctx.db.query.boards.findFirst({
        where: eq(boards.id, input.boardId),
      });

      if (!board) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Board not found",
        });
      }

      // Generate suggestions using the AI service
      const evaluation = await evaluateBoard({
        title: board.title,
        description: board.description,
        prompt: board.prompt,
      });

      if (!evaluation) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate suggestions",
        });
      }

      // Prepare sections for batch insert
      const sectionsToInsert = evaluation.suggestedSections.map(
        (section, index) => ({
          id: nanoid(),
          boardId: input.boardId,
          sortOrder: index,
          ...omit(section, "items"),
        }),
      );

      // Batch insert all sections
      const insertedSections = await ctx.db
        .insert(boardSections)
        .values(sectionsToInsert)
        .returning();

      // Prepare items for batch insert
      const itemsToInsert = evaluation.suggestedSections.flatMap(
        (section, sectionIndex) => {
          const insertedSection = insertedSections[sectionIndex];
          if (!insertedSection) return [];

          return section.items.map((item, itemIndex) => ({
            id: nanoid(),
            sectionId: insertedSection.id,
            sortOrder: itemIndex,
            ...item,
          }));
        },
      );

      // Batch insert all items
      const insertedItems =
        itemsToInsert.length > 0
          ? await ctx.db.insert(boardItems).values(itemsToInsert).returning()
          : [];

      // Build the response with sections and their items
      const createdSections = insertedSections.map((section) => ({
        ...section,
        items: insertedItems.filter((item) => item.sectionId === section.id),
      }));

      return {
        success: true,
        sections: createdSections,
      };
    }),
});
