import { drizzle } from "drizzle-orm/neon-http";
import {
  adjustmentNotes,
  adjustmentNotesRelations,
} from "@/db/schemas/adjustment-notes";
import { authSchema } from "@/db/schemas/auth-schema";
import { creditNotes, creditNotesRelations } from "@/db/schemas/credit-notes";
import { customers, customersRelations } from "@/db/schemas/customers";
import {
  factusCredentials,
  factusCredentialsRelations,
} from "@/db/schemas/factus-credentials";
import { invoices, invoicesRelations } from "@/db/schemas/invoices";
import { products, productsRelations } from "@/db/schemas/products";
import { providers, providersRelations } from "@/db/schemas/providers";
import {
  supportDocuments,
  supportDocumentsRelations,
} from "@/db/schemas/support-documents";
import { env } from "@/lib/env";

const schema = {
  ...authSchema,
  factusCredentials,
  factusCredentialsRelations,
  adjustmentNotes,
  adjustmentNotesRelations,
  creditNotes,
  creditNotesRelations,
  customers,
  customersRelations,
  products,
  productsRelations,
  invoices,
  invoicesRelations,
  supportDocuments,
  supportDocumentsRelations,
  providers,
  providersRelations,
};

export const db = drizzle(env.DATABASE_URL, { schema });
