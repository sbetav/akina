import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { FACTUS_ENVIRONMENTS } from "@/lib/constants";
import { user } from "./auth-schema";

export const factusCredentials = pgTable(
  "factus_credentials",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    /** User-given name for this credential set, e.g. "Mi empresa SAS" */
    name: text("name").notNull(),

    username: text("username").notNull(),
    clientId: text("client_id").notNull(),

    // Encrypted with AES-256-GCM — stored as "iv:tag:ciphertext" hex string
    password: text("password").notNull(),
    clientSecret: text("client_secret").notNull(),

    environment: text("environment", {
      enum: FACTUS_ENVIRONMENTS,
    })
      .notNull()
      .default("sandbox"),

    /**
     * Whether this credential set is the active one for the user.
     * At most one row per user should have isActive = true.
     * If false for all rows, the user falls back to Akina Sandbox.
     */
    isActive: boolean("is_active").notNull().default(false),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("factus_credentials_userId_idx").on(table.userId),
    index("factus_credentials_userId_isActive_idx").on(
      table.userId,
      table.isActive,
    ),
  ],
);

export const factusCredentialsRelations = relations(
  factusCredentials,
  ({ one }) => ({
    user: one(user, {
      fields: [factusCredentials.userId],
      references: [user.id],
    }),
  }),
);
