import { and, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import {
  type ApiResponse,
  type BillListItem,
  type CustomerTributeId,
  type IdentityDocumentTypeId,
  type OrganizationTypeId,
  type PaymentFormCode,
  type PaymentMethodCode,
  type ProductStandardId,
  type ViewBillData,
  FactusError,
} from "factus-js";
import { ulid } from "ulid";
import { db } from "@/db/drizzle";
import { creditNotes } from "@/db/schemas/credit-notes";
import { invoices } from "@/db/schemas/invoices";
import { NotFoundError } from "@/elysia/errors";
import {
  createWorkspaceFilter,
  getActiveCredentialsIdForUser,
} from "@/elysia/workspace";
import { getFactusClientForUser } from "@/lib/factus";
import { buildFactusInvoiceItems } from "@/lib/invoices/factus";
import { getSearchTerms } from "@/lib/utils";
import { isFactusNotFoundError } from "@/elysia/factus-errors";

// ─── Input types ──────────────────────────────────────────────────────────────

export interface InvoiceCustomerInput {
  identification: string;
  dv?: string;
  identificationDocumentId: IdentityDocumentTypeId;
  legalOrganizationId: OrganizationTypeId;
  tributeId: CustomerTributeId;
  name: string;
  tradeName?: string;
  address?: string;
  email?: string;
  phone?: string;
  municipalityId?: string;
}

export interface InvoiceItemInput {
  code: string;
  name: string;
  price: number;
  taxRate: number;
  unitMeasureId: string;
  standardCodeId: ProductStandardId;
  isExcluded: boolean;
  tributeId: string;
  quantity: number;
  discountRate: number;
}

export interface InvoiceCreateInput {
  numberingRangeId?: number;
  observation?: string;
  paymentForm?: PaymentFormCode;
  paymentDueDate?: string;
  paymentMethodCode?: PaymentMethodCode;
  sendEmail?: boolean;
  customer: InvoiceCustomerInput;
  items: InvoiceItemInput[];
}

export interface InvoiceListQueryInput {
  search?: string;
  page?: number;
  limit?: number;
}

// ─── Result types ─────────────────────────────────────────────────────────────

export interface InvoiceRecordResult {
  id: string;
  number: string;
  status: number;
  customerName: string;
  customerIdentification: string;
  total: string | null;
  creditNoteCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceListResult {
  items: InvoiceRecordResult[];
  total: number;
  page: number;
  limit: number;
}

// ─── Workspace filter ─────────────────────────────────────────────────────────

const buildFilter = createWorkspaceFilter(invoices);

// ─── Helpers ──────────────────────────────────────────────────────────────────


function normalizeRow(row: {
  id: string;
  number: string;
  status: number;
  customerName: string;
  customerIdentification: string;
  total: string | null;
  creditNoteCount: number;
  createdAt: Date;
  updatedAt: Date;
}): InvoiceRecordResult {
  return {
    id: row.id,
    number: row.number,
    status: row.status,
    customerName: row.customerName,
    customerIdentification: row.customerIdentification,
    total: row.total,
    creditNoteCount: row.creditNoteCount,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function generateInvoiceReferenceCode(): string {
  return `AKN-${ulid()}`;
}

function getRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  return value as Record<string, unknown>;
}

function toNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed.length) return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function toNumericString(value: unknown): string | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  return null;
}

function pickFirstString(...values: unknown[]): string | null {
  for (const value of values) {
    const parsed = toNonEmptyString(value);
    if (parsed) return parsed;
  }
  return null;
}

function extractPersistableFields(
  payload: unknown,
  fallbackReferenceCode: string,
): {
  number: string;
  referenceCode: string;
  status: number;
  customerName: string;
  customerIdentification: string;
  total: string | null;
} {
  const root = getRecord(payload);
  const bill = getRecord(root?.bill);
  const customer = getRecord(root?.customer);

  const number = pickFirstString(root?.number, bill?.number);
  if (!number) {
    throw new Error("Factus no devolvio el numero de la factura creada");
  }

  const customerIdentification = pickFirstString(
    root?.identification,
    customer?.identification,
  );
  if (!customerIdentification) {
    throw new Error("Factus no devolvió la identificación del cliente");
  }

  const customerName = pickFirstString(
    root?.graphic_representation_name,
    root?.names,
    root?.trade_name,
    root?.company,
    customer?.graphic_representation_name,
    customer?.trade_name,
    customer?.company,
    customer?.names,
  );
  if (!customerName) {
    throw new Error("Factus no devolvió el nombre del cliente");
  }

  return {
    number,
    referenceCode:
      pickFirstString(root?.reference_code, bill?.reference_code) ??
      fallbackReferenceCode,
    status: toFiniteNumber(root?.status ?? bill?.status) ?? 0,
    customerName,
    customerIdentification,
    total: toNumericString(root?.total ?? bill?.total),
  };
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const InvoiceService = {
  /**
   * Creates and validates a new invoice:
   * 1. Generates an internal Factus reference code.
   * 2. Maps the customer and items to the Factus API format.
   * 3. Calls `bills.create()` on the active Factus client.
   * 4. Persists the invoice record to our DB.
   * 5. Returns the saved record.
   *
   * Propagates `FactusError` to the route handler so DIAN validation
   * rule violations can be surfaced with their structured error codes.
   */
  async create(
    userId: string,
    input: InvoiceCreateInput,
  ): Promise<InvoiceRecordResult> {
    const credentialsId = await getActiveCredentialsIdForUser(userId);

    const client = await getFactusClientForUser(userId);

    // Map customer — send `name` as both `company` and `names` to avoid
    // conditional logic based on organization type (user decision).
    const customer = {
      identification_document_id: input.customer.identificationDocumentId,
      identification: input.customer.identification,
      dv: input.customer.dv,
      company: input.customer.name,
      trade_name: input.customer.tradeName,
      names: input.customer.name,
      address: input.customer.address,
      email: input.customer.email,
      phone: input.customer.phone,
      legal_organization_id: input.customer.legalOrganizationId,
      tribute_id: input.customer.tributeId,
      municipality_id: input.customer.municipalityId,
    };

    // Map items: camelCase DB format -> snake_case Factus format.
    const items = buildFactusInvoiceItems(input.items);

    const referenceCode = generateInvoiceReferenceCode();

    // Call Factus. If DIAN validation fails, Factus may leave a pending draft
    // bound to the reference code; clean it up immediately to avoid later
    // "factura pendiente por enviar" conflicts for users sharing credentials.
    let res: ApiResponse<BillListItem>;
    try {
      res = await client.bills.create({
        reference_code: referenceCode,
        numbering_range_id: input.numberingRangeId,
        observation: input.observation,
        payment_form: input.paymentForm,
        payment_due_date: input.paymentDueDate,
        payment_method_code: input.paymentMethodCode,
        send_email: input.sendEmail,
        customer,
        items,
      });
    } catch (error) {
      if (error instanceof FactusError && error.validationErrors) {
        try {
          await client.bills.delete(referenceCode);
        } catch {
          // Best-effort cleanup. Keep the original DIAN validation error.
        }
      }

      throw error;
    }

    const persisted = extractPersistableFields(res.data, referenceCode);

    // Persist to DB — denormalize key display fields from the Factus response
    const [row] = await db
      .insert(invoices)
      .values({
        credentialsId,
        userId,
        number: persisted.number,
        referenceCode: persisted.referenceCode,
        status: persisted.status,
        customerName: persisted.customerName,
        customerIdentification: persisted.customerIdentification,
        total: persisted.total,
      })
      .returning();

    return normalizeRow({ ...row, creditNoteCount: 0 });
  },

  /**
   * Returns a paginated list of invoices for the active workspace.
   * Search tokenizes the query and matches partial terms against customerName
   * and number (case-insensitive), ignoring punctuation.
   */
  async list(
    userId: string,
    options: InvoiceListQueryInput,
  ): Promise<InvoiceListResult> {
    const credentialsId = await getActiveCredentialsIdForUser(userId);

    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const offset = (page - 1) * limit;

    const baseFilter = buildFilter(userId, credentialsId);

    const searchTerms = getSearchTerms(options.search);
    const searchFilter =
      searchTerms.length > 0
        ? or(
            ...searchTerms.flatMap((term) => [
              ilike(invoices.customerName, `%${term}%`),
              ilike(invoices.number, `%${term}%`),
            ]),
          )
        : undefined;

    const whereClause = searchFilter
      ? and(baseFilter, searchFilter)
      : baseFilter;

    const [rows, [{ value: total }]] = await Promise.all([
      db
        .select({
          id: invoices.id,
          number: invoices.number,
          status: invoices.status,
          customerName: invoices.customerName,
          customerIdentification: invoices.customerIdentification,
          total: invoices.total,
          creditNoteCount: sql<number>`(
            select count(*)::int
            from ${creditNotes}
            where ${eq(creditNotes.invoiceId, invoices.id)}
          )`.mapWith(Number),
          createdAt: invoices.createdAt,
          updatedAt: invoices.updatedAt,
        })
        .from(invoices)
        .where(whereClause)
        .orderBy(desc(invoices.createdAt))
        .limit(limit)
        .offset(offset),

      db.select({ value: count() }).from(invoices).where(whereClause),
    ]);

    return {
      items: rows.map(normalizeRow),
      total: Number(total),
      page,
      limit,
    };
  },

  /**
   * Fetches the full invoice detail from Factus by its DIAN number.
   * First verifies ownership via our DB (userId + active credentialsId).
   * Throws 404 if the invoice is not found or doesn't belong to the user.
   */
  async getFromFactus(userId: string, id: string): Promise<ViewBillData> {
    const credentialsId = await getActiveCredentialsIdForUser(userId);

    const row = await db.query.invoices.findFirst({
      where: buildFilter(userId, credentialsId, id),
      columns: { number: true },
    });

    if (!row) {
      throw new NotFoundError("Factura no encontrada");
    }

    const client = await getFactusClientForUser(userId);
    try {
      const res = await client.bills.get(row.number);
      return res.data;
    } catch (error) {
      if (isFactusNotFoundError(error)) {
        throw new NotFoundError("Factura no encontrada");
      }

      throw error;
    }
  },

  /**
   * Downloads the invoice PDF from Factus as a base64-encoded string.
   * First verifies ownership via our DB (userId + active credentialsId).
   * Throws 404 if the invoice is not found or doesn't belong to the user.
   */
  async downloadPdf(
    userId: string,
    id: string,
  ): Promise<{ fileName: string; pdfBase64: string }> {
    const credentialsId = await getActiveCredentialsIdForUser(userId);

    const row = await db.query.invoices.findFirst({
      where: buildFilter(userId, credentialsId, id),
      columns: { number: true },
    });

    if (!row) {
      throw new NotFoundError("Factura no encontrada");
    }

    const client = await getFactusClientForUser(userId);
    try {
      const res = await client.bills.downloadPdf(row.number);

      return {
        fileName: res.data.file_name,
        pdfBase64: res.data.pdf_base_64_encoded,
      };
    } catch (error) {
      if (isFactusNotFoundError(error)) {
        throw new NotFoundError("Factura no encontrada");
      }

      throw error;
    }
  },

  /**
   * Deletes a non-validated invoice from Factus and removes it from our DB.
   * First verifies ownership via our DB (userId + active credentialsId).
   *
   * Note: Factus only allows deleting invoices that have NOT been validated
   * by the DIAN (status = 0). Attempting to delete a validated invoice will
   * result in a FactusError propagated to the route handler.
   *
   * Throws 404 if the invoice is not found or doesn't belong to the user.
   */
  async delete(userId: string, id: string): Promise<void> {
    const credentialsId = await getActiveCredentialsIdForUser(userId);

    const row = await db.query.invoices.findFirst({
      where: buildFilter(userId, credentialsId, id),
      columns: { referenceCode: true },
    });

    if (!row) {
      throw new NotFoundError("Factura no encontrada");
    }

    // Call Factus first — let FactusError propagate if the invoice is validated
    const client = await getFactusClientForUser(userId);
    try {
      await client.bills.delete(row.referenceCode);
    } catch (error) {
      if (isFactusNotFoundError(error)) {
        throw new NotFoundError("Factura no encontrada");
      }

      throw error;
    }

    // Remove from our DB only after Factus confirms deletion
    await db.delete(invoices).where(buildFilter(userId, credentialsId, id));
  },
};
