import { relations, sql } from "drizzle-orm";
import { index, pgTableCreator, primaryKey } from "drizzle-orm/pg-core";
import type { AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `pleeboo_${name}`);

export const boards = createTable(
  "board",
  (d) => ({
    id: d.varchar({ length: 32 }).primaryKey(),
    title: d.varchar({ length: 256 }).notNull(),
    description: d.text(),
    prompt: d.text(),
    createdById: d.varchar({ length: 255 }).references(() => users.id),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("board_created_at_idx").on(t.createdAt)],
);

export const boardsRelations = relations(boards, ({ many, one }) => ({
  sections: many(boardSections),
  createdBy: one(users, {
    fields: [boards.createdById],
    references: [users.id],
  }),
  accessTokens: many(boardAccessTokens),
}));

export const boardSections = createTable(
  "board_section",
  (d) => ({
    id: d.varchar({ length: 32 }).primaryKey(),
    boardId: d
      .varchar({ length: 32 })
      .notNull()
      .references(() => boards.id, { onDelete: "cascade" }),
    title: d.varchar({ length: 256 }).notNull(),
    description: d.text(),
    icon: d.varchar({ length: 50 }).notNull().default("Package"),
    sortOrder: d.integer().notNull().default(0),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("board_section_board_idx").on(t.boardId),
    index("board_section_sort_idx").on(t.sortOrder),
  ],
);

export const boardSectionsRelations = relations(
  boardSections,
  ({ one, many }) => ({
    board: one(boards, {
      fields: [boardSections.boardId],
      references: [boards.id],
    }),
    items: many(boardItems),
  }),
);

export const boardItems = createTable(
  "board_item",
  (d) => ({
    id: d.varchar({ length: 32 }).primaryKey(),
    sectionId: d
      .varchar({ length: 32 })
      .notNull()
      .references(() => boardSections.id, { onDelete: "cascade" }),
    title: d.varchar({ length: 256 }).notNull(),
    description: d.text(),
    icon: d.varchar({ length: 50 }).notNull().default("Star"),
    needed: d.integer().notNull().default(1),
    itemType: d
      .varchar({ length: 20 })
      .notNull()
      .default("slots")
      .$type<"slots" | "task" | "cumulative">(), // slots=bring items, task=do something, cumulative=target amount
    unit: d.varchar({ length: 50 }), // e.g., "kg", "litres", "dozen", etc. for cumulative items
    sortOrder: d.integer().notNull().default(0),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("board_item_section_idx").on(t.sectionId),
    index("board_item_sort_idx").on(t.sortOrder),
  ],
);

export const boardItemsRelations = relations(boardItems, ({ one, many }) => ({
  section: one(boardSections, {
    fields: [boardItems.sectionId],
    references: [boardSections.id],
  }),
  volunteers: many(boardVolunteers),
}));

export const boardVolunteers = createTable(
  "board_volunteer",
  (d) => ({
    id: d.varchar({ length: 32 }).primaryKey(),
    itemId: d
      .varchar({ length: 32 })
      .notNull()
      .references(() => boardItems.id, { onDelete: "cascade" }),
    slot: d.integer().notNull().default(0),
    name: d.varchar({ length: 256 }).notNull(),
    details: d.text(),
    quantity: d.integer(), // For cumulative items, the amount contributed (e.g., 2 for "2kg")
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("board_volunteer_item_idx").on(t.itemId),
    index("board_volunteer_item_slot_idx").on(t.itemId, t.slot),
  ],
);

export const boardVolunteersRelations = relations(
  boardVolunteers,
  ({ one }) => ({
    item: one(boardItems, {
      fields: [boardVolunteers.itemId],
      references: [boardItems.id],
    }),
  }),
);

export const boardAccessTokens = createTable(
  "board_access_token",
  (d) => ({
    id: d.varchar({ length: 32 }).primaryKey(),
    boardId: d
      .varchar({ length: 32 })
      .notNull()
      .references(() => boards.id, { onDelete: "cascade" }),
    type: d.varchar({ length: 10 }).notNull().$type<"admin" | "view">(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    expiresAt: d.timestamp({ withTimezone: true }),
  }),
  (t) => [
    index("board_access_token_board_idx").on(t.boardId),
    index("board_access_token_type_idx").on(t.type),
  ],
);

export const boardAccessTokensRelations = relations(
  boardAccessTokens,
  ({ one }) => ({
    board: one(boards, {
      fields: [boardAccessTokens.boardId],
      references: [boards.id],
    }),
  }),
);

export const users = createTable("user", (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: d.varchar({ length: 255 }),
  email: d.varchar({ length: 255 }).notNull(),
  emailVerified: d
    .timestamp({
      mode: "date",
      withTimezone: true,
    })
    .default(sql`CURRENT_TIMESTAMP`),
  image: d.varchar({ length: 255 }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}));

export const accounts = createTable(
  "account",
  (d) => ({
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    type: d.varchar({ length: 255 }).$type<AdapterAccount["type"]>().notNull(),
    provider: d.varchar({ length: 255 }).notNull(),
    providerAccountId: d.varchar({ length: 255 }).notNull(),
    refresh_token: d.text(),
    access_token: d.text(),
    expires_at: d.integer(),
    token_type: d.varchar({ length: 255 }),
    scope: d.varchar({ length: 255 }),
    id_token: d.text(),
    session_state: d.varchar({ length: 255 }),
  }),
  (t) => [
    primaryKey({ columns: [t.provider, t.providerAccountId] }),
    index("account_user_id_idx").on(t.userId),
  ],
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  (d) => ({
    sessionToken: d.varchar({ length: 255 }).notNull().primaryKey(),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [index("t_user_id_idx").on(t.userId)],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  (d) => ({
    identifier: d.varchar({ length: 255 }).notNull(),
    token: d.varchar({ length: 255 }).notNull(),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);
