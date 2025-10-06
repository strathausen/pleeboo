import {
  validateAdminToken,
  validateAdminTokenForItem,
} from "@/server/api/auth/board-auth";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { boardItems, boardSections, boardVolunteers } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";

export const boardItemsRouter = createTRPCRouter({
  add: publicProcedure
    .input(
      z.object({
        boardId: z.string(),
        sectionId: z.string(),
        title: z.string(),
        description: z.string().optional(),
        icon: z.string(),
        needed: z.number(),
        itemType: z.enum(["slots", "task", "cumulative"]).optional(),
        unit: z.string().optional().nullable(),
        token: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Validate board access
      await validateAdminToken(input.boardId, input.token);

      // Verify section exists and belongs to board
      const section = await ctx.db.query.boardSections.findFirst({
        where: and(
          eq(boardSections.id, input.sectionId),
          eq(boardSections.boardId, input.boardId),
        ),
      });

      if (!section) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Section not found",
        });
      }

      // Get max sort order for items in this section
      const items = await ctx.db.query.boardItems.findMany({
        where: eq(boardItems.sectionId, input.sectionId),
        orderBy: desc(boardItems.sortOrder),
      });

      const sortOrder = (items[0]?.sortOrder ?? -1) + 1;

      const [newItem] = await ctx.db
        .insert(boardItems)
        .values({
          id: nanoid(),
          sectionId: input.sectionId,
          title: input.title,
          description: input.description,
          icon: input.icon,
          needed: input.needed,
          itemType: input.itemType || "slots",
          unit: input.unit,
          sortOrder,
        })
        .returning();

      return newItem;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().optional().nullable(),
        icon: z.string().optional(),
        needed: z.number().optional(),
        itemType: z.enum(["slots", "task", "cumulative"]).optional(),
        unit: z.string().optional().nullable(),
        token: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await validateAdminTokenForItem(input.id, input.token);

      const updatedValues: Record<string, unknown> = {};
      if (input.title !== undefined) updatedValues.title = input.title;
      if (input.description !== undefined)
        updatedValues.description = input.description;
      if (input.icon !== undefined) updatedValues.icon = input.icon;
      if (input.needed !== undefined) updatedValues.needed = input.needed;
      if (input.itemType !== undefined) updatedValues.itemType = input.itemType;
      if (input.unit !== undefined) updatedValues.unit = input.unit;

      if (Object.keys(updatedValues).length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No values to update",
        });
      }

      await ctx.db
        .update(boardItems)
        .set(updatedValues)
        .where(eq(boardItems.id, input.id));

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
      await validateAdminTokenForItem(input.id, input.token);

      // This will cascade delete volunteers
      await ctx.db.delete(boardItems).where(eq(boardItems.id, input.id));

      return { success: true };
    }),

  upsertVolunteer: publicProcedure
    .input(
      z.object({
        itemId: z.string(),
        slot: z.number(),
        name: z.string(),
        details: z.string().optional(),
        quantity: z.number().optional().nullable(),
        token: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if a volunteer already exists for this slot
      const existingVolunteer = await ctx.db.query.boardVolunteers.findFirst({
        where: and(
          eq(boardVolunteers.itemId, input.itemId),
          eq(boardVolunteers.slot, input.slot),
        ),
      });

      if (existingVolunteer) {
        // Update existing volunteer
        await ctx.db
          .update(boardVolunteers)
          .set({
            name: input.name,
            details: input.details,
            quantity: input.quantity,
            updatedAt: new Date(),
          })
          .where(eq(boardVolunteers.id, existingVolunteer.id));

        return {
          ...existingVolunteer,
          name: input.name,
          details: input.details,
        };
      }

      // Create new volunteer
      const [newVolunteer] = await ctx.db
        .insert(boardVolunteers)
        .values({
          id: nanoid(),
          itemId: input.itemId,
          slot: input.slot,
          name: input.name,
          details: input.details,
          quantity: input.quantity,
        })
        .returning();

      return newVolunteer;
    }),
});
