import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { factusCredentials } from "./factus-credentials";

export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    /**
     * The Factus credential (workspace) this invoice belongs to.
     * NULL means the user was on the Akina Sandbox when the invoice was created.
     * Cascade delete: removing a credential set wipes its invoices.
     */
    credentialsId: uuid("credentials_id").references(
      () => factusCredentials.id,
      { onDelete: "cascade" },
    ),

    /**
     * Denormalized user reference for fast ownership checks without a join.
     * Cascade delete: removing the user wipes all their invoices.
     */
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // ─── Factus identifiers ───────────────────────────────────────────────────

    /**
     * DIAN-assigned invoice number returned by Factus after creation
     * (e.g. "SETP990000203"). Used to fetch details and download the PDF.
     */
    number: text("number").notNull(),

    /**
     * Our internal reference code sent at creation time (e.g. "F-0001").
     * Used to delete a non-validated invoice from Factus.
     */
    referenceCode: text("reference_code").notNull(),

    // ─── Status ──────────────────────────────────────────────────────────────

    /**
     * Invoice status code returned by Factus.
     * 0 = not validated (can be deleted), 1 = validated by DIAN.
     */
    status: integer("status").notNull().default(0),

    // ─── Denormalized fields (for list display) ───────────────────────────────

    /** Customer display name (graphic_representation_name from Factus). */
    customerName: text("customer_name").notNull(),

    /** Customer document number. */
    customerIdentification: text("customer_identification").notNull(),

    /** Invoice total amount — stored as numeric string. */
    total: numeric("total", { precision: 12, scale: 2 }),

    // ─── Timestamps ──────────────────────────────────────────────────────────

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("invoices_userId_idx").on(table.userId),
    index("invoices_credentialsId_idx").on(table.credentialsId),
    uniqueIndex("invoices_user_referenceCode_sandbox_unique")
      .on(table.userId, table.referenceCode)
      .where(sql`${table.credentialsId} is null`),
    uniqueIndex("invoices_user_credentials_referenceCode_unique")
      .on(table.userId, table.credentialsId, table.referenceCode)
      .where(sql`${table.credentialsId} is not null`),
  ],
);

export const invoicesRelations = relations(invoices, ({ one }) => ({
  credential: one(factusCredentials, {
    fields: [invoices.credentialsId],
    references: [factusCredentials.id],
  }),
  user: one(user, {
    fields: [invoices.userId],
    references: [user.id],
  }),
}));
