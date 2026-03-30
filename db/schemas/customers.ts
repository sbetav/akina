import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import {
  CustomerTributeId,
  IdentityDocumentTypeId,
  OrganizationTypeId,
} from "factus-js";
import { user } from "./auth-schema";
import { factusCredentials } from "./factus-credentials";

export const customers = pgTable(
  "customers",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    /**
     * The Factus credential (workspace) this customer belongs to.
     * NULL means the user was on the Akina Sandbox when the customer was created.
     * Cascade delete: removing a credential set wipes its customers.
     */
    credentialsId: uuid("credentials_id").references(
      () => factusCredentials.id,
      { onDelete: "cascade" },
    ),

    /**
     * Denormalized user reference for fast ownership checks without a join.
     * Cascade delete: removing the user wipes all their customers.
     */
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // ─── Identification ──────────────────────────────────────────────────────

    /** Document number (CC, NIT, passport, etc.) */
    identification: text("identification").notNull(),

    /** Verification digit — only present when identificationDocumentId = "6" (NIT) */
    dv: text("dv"),

    /** Foreign key to the Factus catalog — e.g. "6" = NIT, "3" = CC */
    identificationDocumentId: text("identification_document_id")
      .notNull()
      .$type<IdentityDocumentTypeId>(),

    // ─── Organization ────────────────────────────────────────────────────────

    /** "1" = legal entity, "2" = natural person */
    legalOrganizationId: text("legal_organization_id")
      .notNull()
      .$type<OrganizationTypeId>(),

    /** Tax regime / tribute — e.g. "21" = IVA responsable */
    tributeId: text("tribute_id").notNull().$type<CustomerTributeId>(),

    /** Full legal name or full name (natural person) */
    name: text("name").notNull(),

    /** Trade name (optional) */
    tradeName: text("trade_name"),

    // ─── Contact ─────────────────────────────────────────────────────────────

    address: text("address").notNull(),
    email: text("email").notNull(),

    /** E.164 formatted phone number — e.g. "+573001234567" */
    phone: text("phone").notNull(),

    /** Factus municipality code */
    municipalityId: text("municipality_id").notNull(),

    // ─── Timestamps ──────────────────────────────────────────────────────────

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("customers_credentialsId_idx").on(table.credentialsId),
    index("customers_userId_idx").on(table.userId),
    // Composite index to speed up the search query (credentials + name/identification)
    index("customers_credentialsId_name_idx").on(
      table.credentialsId,
      table.name,
    ),
  ],
);

export const customersRelations = relations(customers, ({ one }) => ({
  credential: one(factusCredentials, {
    fields: [customers.credentialsId],
    references: [factusCredentials.id],
  }),
  user: one(user, {
    fields: [customers.userId],
    references: [user.id],
  }),
}));
