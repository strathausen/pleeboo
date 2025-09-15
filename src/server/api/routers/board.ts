import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { boards, tasks } from "@/server/db/schema";
import { desc, eq } from "drizzle-orm";
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
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const boardId = generateBoardId();

      const [board] = await ctx.db
        .insert(boards)
        .values({
          id: boardId,
          title: input.title,
          description: input.description,
        })
        .returning();

      return board;
    }),

  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const board = await ctx.db.query.boards.findFirst({
        where: eq(boards.id, input.id),
        with: {
          tasks: {
            orderBy: [desc(tasks.createdAt)],
          },
        },
      });

      if (!board) {
        throw new Error("Board not found");
      }

      return board;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(256).optional(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      const [board] = await ctx.db
        .update(boards)
        .set(updates)
        .where(eq(boards.id, id))
        .returning();

      return board;
    }),

  addTask: publicProcedure
    .input(
      z.object({
        boardId: z.string(),
        content: z.string().min(1),
        pledgedBy: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [task] = await ctx.db
        .insert(tasks)
        .values({
          boardId: input.boardId,
          content: input.content,
          pledgedBy: input.pledgedBy,
          completed: false,
        })
        .returning();

      return task;
    }),

  updateTask: publicProcedure
    .input(
      z.object({
        id: z.number(),
        content: z.string().min(1).optional(),
        pledgedBy: z.string().optional(),
        completed: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      const [task] = await ctx.db
        .update(tasks)
        .set(updates)
        .where(eq(tasks.id, id))
        .returning();

      return task;
    }),

  deleteTask: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(tasks).where(eq(tasks.id, input.id));
      return { success: true };
    }),

  getRecent: publicProcedure.query(async ({ ctx }) => {
    const recentBoards = await ctx.db.query.boards.findMany({
      orderBy: [desc(boards.createdAt)],
      limit: 10,
      with: {
        tasks: {
          limit: 3,
        },
      },
    });

    return recentBoards;
  }),
});
