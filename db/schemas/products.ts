import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import type { ProductStandardId } from "factus-js";
import { PRODUCT_TYPES } from "@/lib/constants";
import { user } from "./auth-schema";
import { factusCredentials } from "./factus-credentials";

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    /**
     * The Factus credential (workspace) this product belongs to.
     * NULL means the user was on the Akina Sandbox when the product was created.
     * Cascade delete: removing a credential set wipes its products.
     */
    credentialsId: uuid("credentials_id").references(
      () => factusCredentials.id,
      { onDelete: "cascade" },
    ),

    /**
     * Denormalized user reference for fast ownership checks without a join.
     * Cascade delete: removing the user wipes all their products.
     */
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // ─── Reference ───────────────────────────────────────────────────────────

    /**
     * Human-readable SKU / reference code, e.g. "P-0001".
     * Unique per workspace (userId + credentialsId).
     * Auto-generated via formatRef("P", nextSeq) but can be overridden.
     */
    code: text("code").notNull(),

    // ─── Details ─────────────────────────────────────────────────────────────

    name: text("name").notNull(),

    /** Optional extended description */
    description: text("description"),

    /** Unit price — stored with up to 2 decimal places */
    price: numeric("price", { precision: 12, scale: 2 }).notNull(),

    // ─── Factus catalog references ────────────────────────────────────────────

    /** Factus measurement unit ID — e.g. "70" = Unidad (UN) */
    unitMeasureId: text("unit_measure_id").notNull(),

    /** Product standard — e.g. "1" = Taxpayer adoption, "2" = UNSPSC */
    standardCodeId: text("standard_code_id")
      .notNull()
      .$type<ProductStandardId>(),

    /**
     * Product tribute ID from Factus dynamic catalog (/v1/tributes/products).
     * Stored as plain text since factus-js does not expose a typed enum for it.
     */
    tributeId: text("tribute_id").notNull(),

    /** Tax rate as decimal, e.g. 0.19 for 19% IVA */
    taxRate: numeric("tax_rate", { precision: 5, scale: 4 }).notNull(),

    /** Whether the product/service is excluded from the tax regime */
    isExcluded: boolean("is_excluded").notNull().default(false),

    /** "product" | "service" */
    type: text("type", { enum: PRODUCT_TYPES }).notNull(),

    // ─── Timestamps ──────────────────────────────────────────────────────────

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("products_credentialsId_idx").on(table.credentialsId),
    index("products_userId_idx").on(table.userId),
    // Composite index to speed up the search query (credentials + name/code)
    index("products_credentialsId_name_idx").on(
      table.credentialsId,
      table.name,
    ),
    uniqueIndex("products_user_code_sandbox_unique")
      .on(table.userId, table.code)
      .where(sql`${table.credentialsId} is null`),
    uniqueIndex("products_user_credentials_code_unique")
      .on(table.userId, table.credentialsId, table.code)
      .where(sql`${table.credentialsId} is not null`),
  ],
);

export const productsRelations = relations(products, ({ one }) => ({
  credential: one(factusCredentials, {
    fields: [products.credentialsId],
    references: [factusCredentials.id],
  }),
  user: one(user, {
    fields: [products.userId],
    references: [user.id],
  }),
}));
