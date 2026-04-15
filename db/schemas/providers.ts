import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import type { SupportDocumentIdentityTypeId } from "factus-js";
import { user } from "./auth-schema";
import { factusCredentials } from "./factus-credentials";

export const providers = pgTable(
  "providers",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    /**
     * The Factus credential (workspace) this provider belongs to.
     * NULL means the user was on the Akina Sandbox when the provider was created.
     * Cascade delete: removing a credential set wipes its providers.
     */
    credentialsId: uuid("credentials_id").references(
      () => factusCredentials.id,
      { onDelete: "cascade" },
    ),

    /**
     * Denormalized user reference for fast ownership checks without a join.
     * Cascade delete: removing the user wipes all their providers.
     */
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // ─── Identification ──────────────────────────────────────────────────────

    /** Document number (NIT, passport, etc.) */
    identification: text("identification").notNull(),

    /** Verification digit — only present when identificationDocumentId = "6" (NIT) */
    dv: text("dv"),

    /** Foreign key to the Factus catalog — e.g. "6" = NIT, "4" = TE */
    identificationDocumentId: text("identification_document_id")
      .notNull()
      .$type<SupportDocumentIdentityTypeId>(),

    // ─── Details ─────────────────────────────────────────────────────────────

    /** Full legal name or business name */
    names: text("names").notNull(),

    /** Trade name (optional) */
    tradeName: text("trade_name"),

    // ─── Location ────────────────────────────────────────────────────────────

    /**
     * Country code — ISO 3166-1 alpha-2 (e.g. "CO", "US").
     * Defaults to "CO" for Colombia.
     */
    countryCode: text("country_code").default("CO"),

    /**
     * Whether the provider is a Colombian resident.
     * 1 = resident, 0 = non-resident.
     * Auto-derived from countryCode: 1 if "CO", 0 otherwise.
     */
    isResident: integer("is_resident"),

    /** Factus municipality code — only relevant when countryCode = "CO" */
    municipalityId: text("municipality_id"),

    // ─── Contact ─────────────────────────────────────────────────────────────

    address: text("address"),
    email: text("email"),

    /** E.164 formatted phone number — e.g. "+573001234567" */
    phone: text("phone"),

    // ─── Timestamps ──────────────────────────────────────────────────────────

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("providers_credentialsId_idx").on(table.credentialsId),
    index("providers_userId_idx").on(table.userId),
    // Composite index to speed up the search query (credentials + names/identification)
    index("providers_credentialsId_names_idx").on(
      table.credentialsId,
      table.names,
    ),
  ],
);

export const providersRelations = relations(providers, ({ one }) => ({
  credential: one(factusCredentials, {
    fields: [providers.credentialsId],
    references: [factusCredentials.id],
  }),
  user: one(user, {
    fields: [providers.userId],
    references: [user.id],
  }),
}));
