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

export const supportDocuments = pgTable(
  "support_documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    /**
     * The Factus credential (workspace) this document belongs to.
     * NULL means the user was on the Akina Sandbox when the document was created.
     * Cascade delete: removing a credential set wipes its support documents.
     */
    credentialsId: uuid("credentials_id").references(
      () => factusCredentials.id,
      { onDelete: "cascade" },
    ),

    /**
     * Denormalized user reference for fast ownership checks without a join.
     * Cascade delete: removing the user wipes all their support documents.
     */
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // ─── Factus identifiers ───────────────────────────────────────────────────

    /**
     * DIAN-assigned document number returned by Factus after creation
     * (e.g. "SEDS984000085"). Used to fetch details and download the PDF.
     */
    number: text("number").notNull(),

    /**
     * Our internal reference code sent at creation time (e.g. "AKN-<ULID>").
     * Used to delete a non-validated document from Factus.
     */
    referenceCode: text("reference_code").notNull(),

    // ─── Status ──────────────────────────────────────────────────────────────

    /**
     * Document status code returned by Factus.
     * 0 = not validated (can be deleted), 1 = validated by DIAN.
     */
    status: integer("status").notNull().default(0),

    // ─── Denormalized fields (for list display) ───────────────────────────────

    /** Provider display name (names / trade_name from Factus). */
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
    index("support_documents_userId_idx").on(table.userId),
    index("support_documents_credentialsId_idx").on(table.credentialsId),
    uniqueIndex("support_documents_referenceCode_unique").on(
      table.referenceCode,
    ),
  ],
);

export const supportDocumentsRelations = relations(
  supportDocuments,
  ({ one }) => ({
    credential: one(factusCredentials, {
      fields: [supportDocuments.credentialsId],
      references: [factusCredentials.id],
    }),
    user: one(user, {
      fields: [supportDocuments.userId],
      references: [user.id],
    }),
  }),
);
