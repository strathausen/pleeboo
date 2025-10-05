import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { boardAccessTokens, boards } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const boardAuthRouter = createTRPCRouter({
  getTokens: publicProcedure
    .input(
      z.object({
        boardId: z.string(),
        token: z.string().optional(),
      }),
    )
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

      // Check if user has admin access via session or token
      const isSessionAdmin =
        ctx.session?.user?.id && board.createdById === ctx.session.user.id;

      // Check if the provided token is the admin token
      const isTokenAdmin =
        input.token && adminToken && input.token === adminToken.id;

      const isAdmin = isSessionAdmin || isTokenAdmin;

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
      if (!input.token) {
        // Check if user is logged in and owns the board
        if (ctx.session?.user?.id) {
          const board = await ctx.db.query.boards.findFirst({
            where: eq(boards.id, input.boardId),
          });

          if (board && board.createdById === ctx.session.user.id) {
            return { access: "admin" as const };
          }
        }
        return { access: "none" as const };
      }

      const accessToken = await ctx.db.query.boardAccessTokens.findFirst({
        where: eq(boardAccessTokens.id, input.token),
      });

      if (!accessToken || accessToken.boardId !== input.boardId) {
        return { access: "none" as const };
      }

      return { access: accessToken.type };
    }),
});
