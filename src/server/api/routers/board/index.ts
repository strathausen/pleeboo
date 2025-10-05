import { validateAdminToken } from "@/server/api/auth/board-auth";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { boardAccessTokens, boards } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { boardAIRouter } from "./ai";
import { boardAuthRouter } from "./auth";
import { boardItemsRouter } from "./items";
import { boardSectionsRouter } from "./sections";

function generateBoardId(): string {
  return nanoid(24);
}

export const boardRouter = createTRPCRouter({
  // Core board CRUD operations
  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(1).max(256),
        description: z.string().optional(),
        prompt: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const boardId = generateBoardId();

      // Create the board
      const [board] = await ctx.db
        .insert(boards)
        .values({
          id: boardId,
          title: input.title,
          description: input.description,
          prompt: input.prompt,
          createdById: ctx.session?.user?.id,
        })
        .returning();

      // Generate access tokens for the board
      const adminToken = nanoid(32);
      const viewToken = nanoid(32);

      await ctx.db.insert(boardAccessTokens).values([
        {
          id: adminToken,
          boardId,
          type: "admin",
        },
        {
          id: viewToken,
          boardId,
          type: "view",
        },
      ]);

      return { id: boardId, adminToken, ...board };
    }),

  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const board = await ctx.db.query.boards.findFirst({
        where: eq(boards.id, input.id),
        with: {
          sections: {
            orderBy: (sections, { asc }) => [asc(sections.sortOrder)],
            with: {
              items: {
                orderBy: (items, { asc }) => [asc(items.sortOrder)],
                with: {
                  volunteers: {
                    orderBy: (volunteers, { asc }) => [asc(volunteers.slot)],
                  },
                },
              },
            },
          },
        },
      });

      if (!board) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Board not found",
        });
      }

      return board;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().optional().nullable(),
        token: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await validateAdminToken(input.id, input.token);

      const updatedValues: Record<string, unknown> = {};
      if (input.title !== undefined) updatedValues.title = input.title;
      if (input.description !== undefined)
        updatedValues.description = input.description;

      if (Object.keys(updatedValues).length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No values to update",
        });
      }

      await ctx.db
        .update(boards)
        .set(updatedValues)
        .where(eq(boards.id, input.id));

      return { success: true };
    }),

  // Merge sub-routers
  auth: boardAuthRouter,
  sections: boardSectionsRouter,
  items: boardItemsRouter,
  ai: boardAIRouter,
});
