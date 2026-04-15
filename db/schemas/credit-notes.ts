import { relations } from "drizzle-orm";
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
import { invoices } from "./invoices";

export const creditNotes = pgTable(
  "credit_notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    /**
     * Parent invoice for ownership checks and invoice-detail listing.
     * Cascade delete: removing an invoice wipes its linked credit notes.
     */
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),

    /**
     * The Factus credential (workspace) this credit note belongs to.
     * NULL means the user was on the Akina Sandbox when it was created.
     * Cascade delete: removing a credential set wipes its credit notes.
     */
    credentialsId: uuid("credentials_id").references(
      () => factusCredentials.id,
      { onDelete: "cascade" },
    ),

    /**
     * Denormalized user reference for fast ownership checks without a join.
     * Cascade delete: removing the user wipes all their credit notes.
     */
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // ─── Factus identifiers ───────────────────────────────────────────────────

    /** DIAN-assigned credit note number returned by Factus. */
    number: text("number").notNull(),

    /** Internal reference code used for same-request cleanup and deletion. */
    referenceCode: text("reference_code").notNull(),

    // ─── Status ──────────────────────────────────────────────────────────────

    /** 0 = not validated, 1 = validated by DIAN. */
    status: integer("status").notNull().default(0),

    // ─── Denormalized fields (for list display) ──────────────────────────────

    customerName: text("customer_name").notNull(),
    customerIdentification: text("customer_identification").notNull(),
    total: numeric("total", { precision: 12, scale: 2 }),

    // ─── Timestamps ──────────────────────────────────────────────────────────

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("credit_notes_invoiceId_idx").on(table.invoiceId),
    index("credit_notes_userId_idx").on(table.userId),
    index("credit_notes_credentialsId_idx").on(table.credentialsId),
    uniqueIndex("credit_notes_referenceCode_unique").on(table.referenceCode),
  ],
);

export const creditNotesRelations = relations(creditNotes, ({ one }) => ({
  invoice: one(invoices, {
    fields: [creditNotes.invoiceId],
    references: [invoices.id],
  }),
  credential: one(factusCredentials, {
    fields: [creditNotes.credentialsId],
    references: [factusCredentials.id],
  }),
  user: one(user, {
    fields: [creditNotes.userId],
    references: [user.id],
  }),
}));
