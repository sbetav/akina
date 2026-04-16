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
import { supportDocuments } from "./support-documents";

export const adjustmentNotes = pgTable(
  "adjustment_notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    /**
     * The parent support document this adjustment note belongs to.
     * Cascade delete: removing a support document wipes its adjustment notes.
     */
    supportDocumentId: uuid("support_document_id")
      .notNull()
      .references(() => supportDocuments.id, { onDelete: "cascade" }),

    /**
     * The Factus credential (workspace) this adjustment note belongs to.
     * NULL means the user was on the Akina Sandbox when the note was created.
     * Cascade delete: removing a credential set wipes its adjustment notes.
     */
    credentialsId: uuid("credentials_id").references(
      () => factusCredentials.id,
      { onDelete: "cascade" },
    ),

    /**
     * Denormalized user reference for fast ownership checks without a join.
     * Cascade delete: removing the user wipes all their adjustment notes.
     */
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // ─── Factus identifiers ───────────────────────────────────────────────────

    /**
     * DIAN-assigned document number returned by Factus after creation
     * (e.g. "NDA35"). Used to fetch details and download the PDF.
     */
    number: text("number").notNull(),

    /**
     * Our internal reference code sent at creation time (e.g. "AKN-AN-<ULID>").
     * Used to delete a non-validated adjustment note from Factus.
     */
    referenceCode: text("reference_code").notNull(),

    // ─── Status ──────────────────────────────────────────────────────────────

    /**
     * Document status code returned by Factus.
     * 0 = not validated (can be deleted), 1 = validated by DIAN.
     */
    status: integer("status").notNull().default(0),

    // ─── Denormalized fields (for list display) ───────────────────────────────

    /** Provider display name (names / trade_name / graphic_representation_name from Factus). */
    providerName: text("provider_name").notNull(),

    /** Provider document number. */
    providerIdentification: text("provider_identification").notNull(),

    /** Document total amount — stored as numeric string. */
    total: numeric("total", { precision: 12, scale: 2 }),

    // ─── Timestamps ──────────────────────────────────────────────────────────

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("adjustment_notes_supportDocumentId_idx").on(table.supportDocumentId),
    index("adjustment_notes_userId_idx").on(table.userId),
    index("adjustment_notes_credentialsId_idx").on(table.credentialsId),
    uniqueIndex("adjustment_notes_referenceCode_unique").on(
      table.referenceCode,
    ),
  ],
);

export const adjustmentNotesRelations = relations(
  adjustmentNotes,
  ({ one }) => ({
    supportDocument: one(supportDocuments, {
      fields: [adjustmentNotes.supportDocumentId],
      references: [supportDocuments.id],
    }),
    credential: one(factusCredentials, {
      fields: [adjustmentNotes.credentialsId],
      references: [factusCredentials.id],
    }),
    user: one(user, {
      fields: [adjustmentNotes.userId],
      references: [user.id],
    }),
  }),
);
