import {
  validateAdminToken,
  validateAdminTokenForItem,
  validateAdminTokenForSection,
} from "@/server/api/auth/board-auth";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  boardAccessTokens,
  boardItems,
  boardSections,
  boards,
} from "@/server/db/schema";
import { evaluateBoard } from "@/server/services/board-evaluator";
import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";

function generateBoardId(): string {
  return nanoid(24);
}

export const boardRouter = createTRPCRouter({
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

      // Evaluate the board with LLM (async, non-blocking)
      evaluateBoard({
        title: input.title,
        description: input.description,
        prompt: input.prompt,
      })
        .then((evaluation) => {
          if (evaluation) {
            console.log(
              `[Board Router] LLM evaluation completed for board ${boardId}`,
            );
          }
        })
        .catch((error) => {
          console.error(
            `[Board Router] LLM evaluation failed for board ${boardId}:`,
            error,
          );
        });

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
        title: z.string().min(1).max(256).optional(),
        description: z.string().optional(),
        token: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, token, ...updates } = input;

      // Validate admin token before allowing update
      await validateAdminToken(id, token);

      const [board] = await ctx.db
        .update(boards)
        .set(updates)
        .where(eq(boards.id, id))
        .returning();

      return board;
    }),

  list: publicProcedure.query(async ({ ctx }) => {
    const boardsList = await ctx.db.query.boards.findMany({
      orderBy: [desc(boards.createdAt)],
      limit: 20,
    });

    return boardsList;
  }),

  updateSection: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(256).optional(),
        description: z.string().optional(),
        icon: z.string().max(50).optional(),
        token: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, token, ...updates } = input;

      // Validate admin token before allowing update
      await validateAdminTokenForSection(id, token);

      await ctx.db
        .update(boardSections)
        .set(updates)
        .where(eq(boardSections.id, id));

      return { success: true };
    }),

  deleteSection: publicProcedure
    .input(
      z.object({
        id: z.string(),
        token: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Validate admin token before allowing deletion
      await validateAdminTokenForSection(input.id, input.token);

      await ctx.db.delete(boardSections).where(eq(boardSections.id, input.id));

      return { success: true };
    }),

  updateItem: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(256).optional(),
        description: z.string().optional(),
        icon: z.string().max(50).optional(),
        needed: z.number().min(1).max(100).optional(),
        token: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, token, ...updates } = input;

      // Validate admin token before allowing update
      await validateAdminTokenForItem(id, token);

      await ctx.db.update(boardItems).set(updates).where(eq(boardItems.id, id));

      return { success: true };
    }),

  deleteItem: publicProcedure
    .input(
      z.object({
        id: z.string(),
        token: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Validate admin token before allowing deletion
      await validateAdminTokenForItem(input.id, input.token);

      await ctx.db.delete(boardItems).where(eq(boardItems.id, input.id));

      return { success: true };
    }),

  addSection: publicProcedure
    .input(
      z.object({
        boardId: z.string(),
        title: z.string().min(1).max(256),
        description: z.string().optional(),
        icon: z.string().max(50),
        token: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { boardId, token, ...sectionData } = input;

      // Validate admin token before allowing section creation
      await validateAdminToken(boardId, token);

      // Get the max sort order for this board
      const maxSortSection = await ctx.db.query.boardSections.findFirst({
        where: eq(boardSections.boardId, boardId),
        orderBy: (sections, { desc }) => [desc(sections.sortOrder)],
      });

      const sortOrder = (maxSortSection?.sortOrder || 0) + 1;

      const sectionId = nanoid(24);
      const [newSection] = await ctx.db
        .insert(boardSections)
        .values({
          id: sectionId,
          boardId,
          ...sectionData,
          sortOrder,
        })
        .returning();

      return newSection;
    }),

  addItem: publicProcedure
    .input(
      z.object({
        sectionId: z.string(),
        title: z.string().min(1).max(256),
        description: z.string().optional(),
        icon: z.string().max(50),
        needed: z.number().min(1).max(100),
        token: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { sectionId, token, ...itemData } = input;

      // Validate admin token before allowing item creation
      await validateAdminTokenForSection(sectionId, token);

      // Get the max sort order for this section
      const maxSortItem = await ctx.db.query.boardItems.findFirst({
        where: eq(boardItems.sectionId, sectionId),
        orderBy: (items, { desc }) => [desc(items.sortOrder)],
      });

      const sortOrder = (maxSortItem?.sortOrder || 0) + 1;

      const itemId = nanoid(24);
      const [newItem] = await ctx.db
        .insert(boardItems)
        .values({
          id: itemId,
          sectionId,
          ...itemData,
          sortOrder,
        })
        .returning();

      return newItem;
    }),

  getTokens: publicProcedure
    .input(z.object({ boardId: z.string() }))
    .query(async ({ ctx, input }) => {
      // First check if the board exists and get the creator
      const board = await ctx.db.query.boards.findFirst({
        where: eq(boards.id, input.boardId),
      });

      if (!board) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Board not found",
        });
      }

      // Get existing tokens for this board
      const tokens = await ctx.db.query.boardAccessTokens.findMany({
        where: eq(boardAccessTokens.boardId, input.boardId),
      });

      const adminToken = tokens.find((t) => t.type === "admin");
      const viewToken = tokens.find((t) => t.type === "view");

      if (!viewToken) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tokens not found for this board",
        });
      }

      // Only return admin token if the user is the board creator
      const isAdmin =
        ctx.session?.user?.id && board.createdById === ctx.session.user.id;

      return {
        adminToken: isAdmin && adminToken ? adminToken.id : undefined,
        viewToken: viewToken.id,
      };
    }),

  validateToken: publicProcedure
    .input(
      z.object({
        boardId: z.string(),
        token: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // First check if the current user is the board creator
      if (ctx.session?.user?.id) {
        const board = await ctx.db.query.boards.findFirst({
          where: eq(boards.id, input.boardId),
        });

        if (board && board.createdById === ctx.session.user.id) {
          return { access: "admin" as const };
        }
      }

      // Otherwise, check token-based access
      if (!input.token) {
        return { access: "none" as const };
      }

      const accessToken = await ctx.db.query.boardAccessTokens.findFirst({
        where: and(
          eq(boardAccessTokens.id, input.token),
          eq(boardAccessTokens.boardId, input.boardId),
        ),
      });

      if (!accessToken) {
        return { access: "none" as const };
      }

      return { access: accessToken.type };
    }),

  reorderSections: publicProcedure
    .input(
      z.object({
        boardId: z.string(),
        sectionIds: z.array(z.string()),
        token: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { boardId, token, sectionIds } = input;

      // Validate admin token before allowing reordering
      await validateAdminToken(boardId, token);

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
