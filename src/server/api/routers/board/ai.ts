import { validateAdminToken } from "@/server/api/auth/board-auth";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { boardItems, boardSections, boards } from "@/server/db/schema";
import { evaluateBoard } from "@/server/services/board-evaluator";
import { TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";

export const boardAIRouter = createTRPCRouter({
  generateSuggestions: publicProcedure
    .input(
      z.object({
        boardId: z.string(),
        token: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Validate admin access - will throw if not admin
      await validateAdminToken(input.boardId, input.token || undefined);

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

      // Get current max sort order for sections
      const existingSections = await ctx.db.query.boardSections.findMany({
        where: eq(boardSections.boardId, input.boardId),
        orderBy: desc(boardSections.sortOrder),
      });

      const maxSectionOrder = existingSections[0]?.sortOrder ?? -1;
      let currentSectionOrder = maxSectionOrder;

      // Create sections and items from the suggestions
      const createdSections = [];
      for (const section of evaluation.suggestedSections) {
        currentSectionOrder++;

        // Create the section
        const [newSection] = await ctx.db
          .insert(boardSections)
          .values({
            id: nanoid(),
            boardId: input.boardId,
            title: section.title,
            description: section.description,
            icon: section.icon,
            sortOrder: currentSectionOrder,
          })
          .returning();

        if (!newSection) continue;

        // Create items for this section
        const createdItems = [];
        for (let i = 0; i < section.items.length; i++) {
          const item = section.items[i];
          if (!item) continue;

          const [newItem] = await ctx.db
            .insert(boardItems)
            .values({
              id: nanoid(),
              sectionId: newSection.id,
              title: item.title,
              description: item.description || undefined,
              icon: item.icon,
              needed: item.quantity,
              sortOrder: i,
            })
            .returning();

          if (newItem) {
            createdItems.push(newItem);
          }
        }

        createdSections.push({
          ...newSection,
          items: createdItems,
        });
      }

      return {
        success: true,
        sections: createdSections,
        tips: evaluation.tips,
        eventType: evaluation.eventType,
      };
    }),
});
