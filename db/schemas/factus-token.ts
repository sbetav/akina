import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const factusToken = pgTable("factus_token", {
  id: text("id").primaryKey().default("singleton"),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
