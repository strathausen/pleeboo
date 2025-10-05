import {
  validateAdminToken,
  validateAdminTokenForSection,
} from "@/server/api/auth/board-auth";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { boardSections } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";

export const boardSectionsRouter = createTRPCRouter({
  add: publicProcedure
    .input(
      z.object({
        boardId: z.string(),
        title: z.string(),
        description: z.string().optional(),
        icon: z.string(),
        token: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await validateAdminToken(input.boardId, input.token);

      // Get max sort order for sections
      const sections = await ctx.db.query.boardSections.findMany({
        where: eq(boardSections.boardId, input.boardId),
        orderBy: desc(boardSections.sortOrder),
      });

      const maxSortOrder = sections[0]?.sortOrder ?? -1;

      const [newSection] = await ctx.db
        .insert(boardSections)
        .values({
          id: nanoid(),
          boardId: input.boardId,
          title: input.title,
          description: input.description,
          icon: input.icon,
          sortOrder: maxSortOrder + 1,
        })
        .returning();

      return newSection;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().optional().nullable(),
        icon: z.string().optional(),
        token: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await validateAdminTokenForSection(input.id, input.token);

      const updatedValues: Record<string, unknown> = {};
      if (input.title !== undefined) updatedValues.title = input.title;
      if (input.description !== undefined)
        updatedValues.description = input.description;
      if (input.icon !== undefined) updatedValues.icon = input.icon;

      if (Object.keys(updatedValues).length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No values to update",
        });
      }

      await ctx.db
        .update(boardSections)
        .set(updatedValues)
        .where(eq(boardSections.id, input.id));

      return { success: true };
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.string(),
        token: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await validateAdminTokenForSection(input.id, input.token);

      // This will cascade delete items and volunteers
      await ctx.db.delete(boardSections).where(eq(boardSections.id, input.id));

      return { success: true };
    }),

  reorder: publicProcedure
    .input(
      z.object({
        boardId: z.string(),
        sectionIds: z.array(z.string()),
        token: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { boardId, sectionIds } = input;

      await validateAdminToken(boardId, input.token);

      // Update sort order for each section
      const updates = sectionIds.map((sectionId, index) =>
        ctx.db
          .update(boardSections)
          .set({ sortOrder: index })
          .where(
            and(
              eq(boardSections.id, sectionId),
              eq(boardSections.boardId, boardId),
            ),
          ),
      );

      await Promise.all(updates);
      return { success: true };
    }),
});
