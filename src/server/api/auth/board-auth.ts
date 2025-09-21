import { db } from "@/server/db";
import {
  boardAccessTokens,
  boardItems,
  boardSections,
} from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

/**
 * Helper function to validate admin access token for a board
 */
export async function validateAdminToken(
  boardId: string,
  token?: string,
): Promise<void> {
  if (!token) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Admin token is required for this operation",
    });
  }

  const accessToken = await db.query.boardAccessTokens.findFirst({
    where: and(
      eq(boardAccessTokens.id, token),
      eq(boardAccessTokens.boardId, boardId),
      eq(boardAccessTokens.type, "admin"),
    ),
  });

  if (!accessToken) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid admin token or insufficient permissions",
    });
  }

  // Check if token has expired (if expiresAt is set)
  if (accessToken.expiresAt && accessToken.expiresAt < new Date()) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Admin token has expired",
    });
  }
}

/**
 * Helper function to get board ID from section ID and validate admin access
 */
export async function validateAdminTokenForSection(
  sectionId: string,
  token?: string,
): Promise<string> {
  const section = await db.query.boardSections.findFirst({
    where: eq(boardSections.id, sectionId),
  });

  if (!section) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Section not found",
    });
  }

  await validateAdminToken(section.boardId, token);
  return section.boardId;
}

/**
 * Helper function to get board ID from item ID and validate admin access
 */
export async function validateAdminTokenForItem(
  itemId: string,
  token?: string,
): Promise<string> {
  const item = await db.query.boardItems.findFirst({
    where: eq(boardItems.id, itemId),
    with: {
      section: true,
    },
  });

  if (!item || !item.section) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Item not found",
    });
  }

  await validateAdminToken(item.section.boardId, token);
  return item.section.boardId;
}
