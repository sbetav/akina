import { and, count, desc, ilike, or } from "drizzle-orm";
import type {
  ApiResponse,
  BillListItem,
  CustomerTributeId,
  IdentityDocumentTypeId,
  OrganizationTypeId,
  PaymentFormCode,
  PaymentMethodCode,
  ProductStandardId,
} from "factus-js";
import { FactusError } from "factus-js";
import { ulid } from "ulid";
import { db } from "@/db/drizzle";
import { invoices } from "@/db/schemas/invoices";
import { NotFoundError } from "@/elysia/errors";
import {
  createWorkspaceFilter,
  getActiveCredentialsIdForUser,
} from "@/elysia/workspace";
import { getFactusClientForUser } from "@/lib/factus";
import { getSearchTerms } from "@/lib/utils";

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

function isFactusNotFoundError(error: unknown): boolean {
  if (!(error instanceof FactusError)) return false;

  const candidate = error as FactusError & {
    status?: number;
    statusCode?: number;
    response?: { status?: number };
    cause?: {
      status?: number;
      statusCode?: number;
      response?: { status?: number };
    };
  };

  return (
    candidate.status === 404 ||
    candidate.statusCode === 404 ||
    candidate.response?.status === 404 ||
    candidate.cause?.status === 404 ||
    candidate.cause?.statusCode === 404 ||
    candidate.cause?.response?.status === 404 ||
    candidate.message.toLowerCase().includes("not found")
  );
}

function normalizeRow(row: {
  id: string;
  number: string;
  status: number;
  customerName: string;
  customerIdentification: string;
  total: string | null;
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
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/**
 * Converts a decimal tax rate (e.g. 0.19) to the percentage string
 * expected by the Factus API (e.g. "19.00").
 */
function toTaxRateString(rate: number): string {
  return (rate * 100).toFixed(2);
}

function generateInvoiceReferenceCode(): string {
  return `AKN-${ulid()}`;
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

    // Map items: camelCase DB format → snake_case Factus format
    const items = input.items.map((item) => ({
      code_reference: item.code,
      name: item.name,
      quantity: item.quantity,
      discount_rate: item.discountRate,
      price: item.price,
      // Convert decimal rate (0.19) to percentage string ("19.00")
      tax_rate: toTaxRateString(item.taxRate),
      // unitMeasureId stored as text in our DB — Factus expects a number
      unit_measure_id: Number(item.unitMeasureId),
      standard_code_id: item.standardCodeId,
      // isExcluded stored as boolean — Factus expects 0 | 1
      is_excluded: (item.isExcluded ? 1 : 0) as 0 | 1,
      // tributeId stored as text in our DB — Factus expects a number
      tribute_id: Number(item.tributeId),
    }));

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

    const bill = res.data;

    // Persist to DB — denormalize key display fields from the Factus response
    const [row] = await db
      .insert(invoices)
      .values({
        credentialsId,
        userId,
        number: bill.number,
        referenceCode: bill.reference_code ?? referenceCode,
        status: bill.status,
        customerName:
          bill.graphic_representation_name || bill.names || bill.company,
        customerIdentification: bill.identification,
        total: bill.total,
      })
      .returning();

    return normalizeRow(row);
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
  async getFromFactus(userId: string, id: string): Promise<unknown> {
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
