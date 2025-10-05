import { boardVolunteers } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import z from "zod";
import { validateAdminTokenForItem } from "../auth/board-auth";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const pledgeRouter = createTRPCRouter({
  upsertVolunteer: publicProcedure
    .input(
      z.object({
        itemId: z.string(),
        slot: z.number().min(0).max(99),
        name: z.string(),
        details: z.string().optional(),
        token: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { itemId, token, slot, ...volunteerData } = input;

      // Validate admin token before allowing volunteer modification
      // await validateAdminTokenForItem(itemId, token);

      // Check if a volunteer exists in this slot
      const existingVolunteer = await ctx.db.query.boardVolunteers.findFirst({
        where: and(
          eq(boardVolunteers.itemId, itemId),
          eq(boardVolunteers.slot, slot),
        ),
      });

      if (existingVolunteer) {
        if (volunteerData.name.trim()) {
          // Update existing volunteer
          await ctx.db
            .update(boardVolunteers)
            .set({ name: volunteerData.name, details: volunteerData.details })
            .where(eq(boardVolunteers.id, existingVolunteer.id));
        } else {
          // Delete if name is empty
          await ctx.db
            .delete(boardVolunteers)
            .where(eq(boardVolunteers.id, existingVolunteer.id));
        }
      } else if (volunteerData.name.trim()) {
        // Create new volunteer in this slot
        await ctx.db.insert(boardVolunteers).values({
          id: nanoid(24),
          itemId,
          slot,
          name: volunteerData.name,
          details: volunteerData.details,
        });
      }

      return { success: true };
    }),
});
