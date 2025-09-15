import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { boards, boardSections, boardItems, boardVolunteers } from "@/server/db/schema";
import { desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

function generateBoardId(): string {
  return nanoid(24);
}

export const boardRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(1).max(256),
        description: z.string().optional(),
        sections: z.array(
          z.object({
            title: z.string().min(1).max(256),
            description: z.string().optional(),
            icon: z.string().max(50),
            items: z.array(
              z.object({
                title: z.string().min(1).max(256),
                description: z.string().optional(),
                icon: z.string().max(50),
                needed: z.number().min(1).max(100),
                volunteers: z.array(
                  z.object({
                    name: z.string().min(1).max(256),
                    details: z.string().optional(),
                  })
                ),
              })
            ),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const boardId = generateBoardId();

      // Create the board
      await ctx.db.insert(boards).values({
        id: boardId,
        title: input.title,
        description: input.description,
        createdById: ctx.session?.user?.id,
      });

      // Create sections and items
      for (let sectionIndex = 0; sectionIndex < input.sections.length; sectionIndex++) {
        const section = input.sections[sectionIndex];

        const [insertedSection] = await ctx.db
          .insert(boardSections)
          .values({
            boardId,
            title: section.title,
            description: section.description,
            icon: section.icon,
            sortOrder: sectionIndex,
          })
          .returning({ id: boardSections.id });

        if (!insertedSection) continue;

        // Create items for this section
        for (let itemIndex = 0; itemIndex < section.items.length; itemIndex++) {
          const item = section.items[itemIndex];

          const [insertedItem] = await ctx.db
            .insert(boardItems)
            .values({
              sectionId: insertedSection.id,
              title: item.title,
              description: item.description,
              icon: item.icon,
              needed: item.needed,
              sortOrder: itemIndex,
            })
            .returning({ id: boardItems.id });

          if (!insertedItem) continue;

          // Create volunteers for this item
          for (const volunteer of item.volunteers) {
            if (volunteer.name.trim()) {
              await ctx.db.insert(boardVolunteers).values({
                itemId: insertedItem.id,
                name: volunteer.name,
                details: volunteer.details,
              });
            }
          }
        }
      }

      return { boardId };
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
                  volunteers: true,
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

  updateVolunteer: publicProcedure
    .input(
      z.object({
        itemId: z.number(),
        volunteerIndex: z.number(),
        name: z.string(),
        details: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get existing volunteers for this item
      const existingVolunteers = await ctx.db.query.boardVolunteers.findMany({
        where: eq(boardVolunteers.itemId, input.itemId),
        orderBy: (volunteers, { asc }) => [asc(volunteers.id)],
      });

      if (input.volunteerIndex < existingVolunteers.length) {
        // Update existing volunteer
        const volunteer = existingVolunteers[input.volunteerIndex];
        if (volunteer) {
          if (input.name.trim()) {
            await ctx.db
              .update(boardVolunteers)
              .set({ name: input.name, details: input.details })
              .where(eq(boardVolunteers.id, volunteer.id));
          } else {
            // Delete if name is empty
            await ctx.db
              .delete(boardVolunteers)
              .where(eq(boardVolunteers.id, volunteer.id));
          }
        }
      } else if (input.name.trim()) {
        // Create new volunteer
        await ctx.db.insert(boardVolunteers).values({
          itemId: input.itemId,
          name: input.name,
          details: input.details,
        });
      }

      return { success: true };
    }),

  list: publicProcedure.query(async ({ ctx }) => {
    const boardsList = await ctx.db.query.boards.findMany({
      orderBy: [desc(boards.createdAt)],
      limit: 20,
    });

    return boardsList;
  }),
});
