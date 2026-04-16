import { and, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import {
  type ApiResponse,
  type PaymentMethodCode,
  type ProductStandardId,
  type SupportDocument,
  type SupportDocumentIdentityTypeId,
  type ViewSupportDocumentData,
  FactusError,
} from "factus-js";
import { ulid } from "ulid";
import { db } from "@/db/drizzle";
import { adjustmentNotes } from "@/db/schemas/adjustment-notes";
import { supportDocuments } from "@/db/schemas/support-documents";
import { NotFoundError } from "@/elysia/errors";
import {
  createWorkspaceFilter,
  getActiveCredentialsIdForUser,
} from "@/elysia/workspace";
import { getFactusClientForUser } from "@/lib/factus";
import { getSearchTerms } from "@/lib/utils";
import { isFactusNotFoundError } from "@/elysia/factus-errors";

// ─── Input types ──────────────────────────────────────────────────────────────

export interface SupportDocumentWithholdingTaxInput {
  code: string;
  withholdingTaxRate: string | number;
}

export interface SupportDocumentItemInput {
  codeReference: string;
  name: string;
  quantity: number;
  discountRate: number;
  price: number;
  unitMeasureId: number;
  standardCodeId: ProductStandardId;
  withholdingTaxes?: SupportDocumentWithholdingTaxInput[];
}

export interface SupportDocumentProviderInput {
  identificationDocumentId: SupportDocumentIdentityTypeId;
  identification: string;
  dv?: number;
  tradeName?: string;
  names: string;
  address: string;
  email: string;
  phone?: string;
  isResident?: 0 | 1;
  countryCode: string;
  municipalityId?: string;
}

export interface SupportDocumentCreateInput {
  numberingRangeId?: number;
  paymentMethodCode?: PaymentMethodCode;
  observation?: string;
  provider: SupportDocumentProviderInput;
  items: SupportDocumentItemInput[];
}

export interface SupportDocumentListQueryInput {
  search?: string;
  page?: number;
  limit?: number;
}

// ─── Result types ─────────────────────────────────────────────────────────────

export interface SupportDocumentRecordResult {
  id: string;
  number: string;
  status: number;
  providerName: string;
  providerIdentification: string;
  total: string | null;
  adjustmentNoteCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SupportDocumentListResult {
  items: SupportDocumentRecordResult[];
  total: number;
  page: number;
  limit: number;
}

// ─── Workspace filter ─────────────────────────────────────────────────────────

const buildFilter = createWorkspaceFilter(supportDocuments);

// ─── Helpers ──────────────────────────────────────────────────────────────────


function normalizeRow(row: {
  id: string;
  number: string;
  status: number;
  providerName: string;
  providerIdentification: string;
  total: string | null;
  adjustmentNoteCount: number;
  createdAt: Date;
  updatedAt: Date;
}): SupportDocumentRecordResult {
  return {
    id: row.id,
    number: row.number,
    status: row.status,
    providerName: row.providerName,
    providerIdentification: row.providerIdentification,
    total: row.total,
    adjustmentNoteCount: row.adjustmentNoteCount,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function generateSupportDocumentReferenceCode(): string {
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
  providerName: string;
  providerIdentification: string;
  total: string | null;
} {
  const root = getRecord(payload);
  const doc = getRecord(root?.support_document);
  const provider = getRecord(root?.provider ?? doc?.provider);

  const number = pickFirstString(root?.number, doc?.number);
  if (!number) {
    throw new Error(
      "Factus no devolvió el número del documento soporte creado",
    );
  }

  const providerIdentification = pickFirstString(
    provider?.identification,
    root?.identification,
  );
  if (!providerIdentification) {
    throw new Error("Factus no devolvió la identificación del proveedor");
  }

  const providerName = pickFirstString(
    provider?.graphic_representation_name,
    provider?.trade_name,
    provider?.names,
    root?.graphic_representation_name,
    root?.names,
  );
  if (!providerName) {
    throw new Error("Factus no devolvió el nombre del proveedor");
  }

  return {
    number,
    referenceCode:
      pickFirstString(root?.reference_code, doc?.reference_code) ??
      fallbackReferenceCode,
    status: toFiniteNumber(root?.status ?? doc?.status) ?? 0,
    providerName,
    providerIdentification,
    total: toNumericString(root?.total ?? doc?.total),
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const SupportDocumentService = {
  /**
   * Creates and validates a new support document:
   * 1. Generates an internal Factus reference code.
   * 2. Maps the provider and items to the Factus API format.
   * 3. Calls `supportDocuments.create()` on the active Factus client.
   * 4. Persists the record to our DB.
   * 5. Returns the saved record.
   *
   * On DIAN validation failure, performs a best-effort delete of the pending
   * Factus draft (same reference code) to prevent "documento pendiente por
   * enviar" conflicts for users sharing credentials, then re-throws the
   * original FactusError.
   */
  async create(
    userId: string,
    input: SupportDocumentCreateInput,
  ): Promise<SupportDocumentRecordResult> {
    const credentialsId = await getActiveCredentialsIdForUser(userId);

    const client = await getFactusClientForUser(userId);

    // Map provider — camelCase input → snake_case Factus format
    const provider = {
      identification_document_id: input.provider.identificationDocumentId,
      identification: input.provider.identification,
      dv:
        input.provider.dv !== undefined ? String(input.provider.dv) : undefined,
      trade_name: input.provider.tradeName,
      names: input.provider.names,
      address: input.provider.address,
      email: input.provider.email,
      phone: input.provider.phone,
      is_resident: input.provider.isResident,
      country_code: input.provider.countryCode,
      municipality_id: input.provider.municipalityId,
    };

    // Map items — camelCase → snake_case
    const items = input.items.map((item) => ({
      code_reference: item.codeReference,
      name: item.name,
      quantity: item.quantity,
      discount_rate: item.discountRate,
      price: item.price,
      unit_measure_id: item.unitMeasureId,
      standard_code_id: item.standardCodeId,
      withholding_taxes: item.withholdingTaxes?.map((wt) => ({
        code: wt.code,
        withholding_tax_rate: String(wt.withholdingTaxRate),
      })),
    }));

    const referenceCode = generateSupportDocumentReferenceCode();

    // Call Factus. If DIAN validation fails, Factus may leave a pending draft
    // bound to the reference code; clean it up immediately to avoid later
    // "documento pendiente por enviar" conflicts for users sharing credentials.
    let res: ApiResponse<SupportDocument>;
    try {
      res = await client.supportDocuments.create({
        reference_code: referenceCode,
        numbering_range_id: input.numberingRangeId,
        payment_method_code: input.paymentMethodCode,
        observation: input.observation,
        provider,
        items,
      });
    } catch (error) {
      if (error instanceof FactusError && error.validationErrors) {
        try {
          await client.supportDocuments.delete(referenceCode);
        } catch {
          // Best-effort cleanup. Keep the original DIAN validation error.
        }
      }

      throw error;
    }

    const persisted = extractPersistableFields(res.data, referenceCode);

    // Persist to DB — denormalize key display fields from the Factus response
    const [row] = await db
      .insert(supportDocuments)
      .values({
        credentialsId,
        userId,
        number: persisted.number,
        referenceCode: persisted.referenceCode,
        status: persisted.status,
        providerName: persisted.providerName,
        providerIdentification: persisted.providerIdentification,
        total: persisted.total,
      })
      .returning();

    return normalizeRow({ ...row, adjustmentNoteCount: 0 });
  },

  /**
   * Returns a paginated list of support documents for the active workspace.
   * Search tokenizes the query and matches partial terms against providerName
   * and number (case-insensitive), ignoring punctuation.
   */
  async list(
    userId: string,
    options: SupportDocumentListQueryInput,
  ): Promise<SupportDocumentListResult> {
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
              ilike(supportDocuments.providerName, `%${term}%`),
              ilike(supportDocuments.number, `%${term}%`),
            ]),
          )
        : undefined;

    const whereClause = searchFilter
      ? and(baseFilter, searchFilter)
      : baseFilter;

    const [rows, [{ value: total }]] = await Promise.all([
      db
        .select({
          id: supportDocuments.id,
          number: supportDocuments.number,
          status: supportDocuments.status,
          providerName: supportDocuments.providerName,
          providerIdentification: supportDocuments.providerIdentification,
          total: supportDocuments.total,
          adjustmentNoteCount: sql<number>`(
            select count(*)::int
            from ${adjustmentNotes}
            where ${eq(adjustmentNotes.supportDocumentId, supportDocuments.id)}
          )`.mapWith(Number),
          createdAt: supportDocuments.createdAt,
          updatedAt: supportDocuments.updatedAt,
        })
        .from(supportDocuments)
        .where(whereClause)
        .orderBy(desc(supportDocuments.createdAt))
        .limit(limit)
        .offset(offset),

      db.select({ value: count() }).from(supportDocuments).where(whereClause),
    ]);

    return {
      items: rows.map(normalizeRow),
      total: Number(total),
      page,
      limit,
    };
  },

  /**
   * Fetches the full support document detail from Factus by its DIAN number.
   * First verifies ownership via our DB (userId + active credentialsId).
   * Throws 404 if the document is not found or doesn't belong to the user.
   */
  async getFromFactus(
    userId: string,
    id: string,
  ): Promise<ViewSupportDocumentData> {
    const credentialsId = await getActiveCredentialsIdForUser(userId);

    const row = await db.query.supportDocuments.findFirst({
      where: buildFilter(userId, credentialsId, id),
      columns: { number: true },
    });

    if (!row) {
      throw new NotFoundError("Documento soporte no encontrado");
    }

    const client = await getFactusClientForUser(userId);
    try {
      const res = await client.supportDocuments.get(row.number);
      return res.data;
    } catch (error) {
      if (isFactusNotFoundError(error)) {
        throw new NotFoundError("Documento soporte no encontrado");
      }

      throw error;
    }
  },

  /**
   * Downloads the support document PDF from Factus as a base64-encoded string.
   * First verifies ownership via our DB (userId + active credentialsId).
   * Throws 404 if the document is not found or doesn't belong to the user.
   */
  async downloadPdf(
    userId: string,
    id: string,
  ): Promise<{ fileName: string; pdfBase64: string }> {
    const credentialsId = await getActiveCredentialsIdForUser(userId);

    const row = await db.query.supportDocuments.findFirst({
      where: buildFilter(userId, credentialsId, id),
      columns: { number: true },
    });

    if (!row) {
      throw new NotFoundError("Documento soporte no encontrado");
    }

    const client = await getFactusClientForUser(userId);
    try {
      const res = await client.supportDocuments.downloadPdf(row.number);

      return {
        fileName: res.data.file_name,
        pdfBase64: res.data.pdf_base_64_encoded,
      };
    } catch (error) {
      if (isFactusNotFoundError(error)) {
        throw new NotFoundError("Documento soporte no encontrado");
      }

      throw error;
    }
  },

  /**
   * Deletes a non-validated support document from Factus and removes it from
   * our DB. First verifies ownership via our DB (userId + active credentialsId).
   *
   * Note: Factus only allows deleting documents that have NOT been validated
   * by the DIAN. Attempting to delete a validated document will result in a
   * FactusError propagated to the route handler.
   *
   * Throws 404 if the document is not found or doesn't belong to the user.
   */
  async delete(userId: string, id: string): Promise<void> {
    const credentialsId = await getActiveCredentialsIdForUser(userId);

    const row = await db.query.supportDocuments.findFirst({
      where: buildFilter(userId, credentialsId, id),
      columns: { referenceCode: true },
    });

    if (!row) {
      throw new NotFoundError("Documento soporte no encontrado");
    }

    // Call Factus first — let FactusError propagate if the document is validated
    const client = await getFactusClientForUser(userId);
    try {
      await client.supportDocuments.delete(row.referenceCode);
    } catch (error) {
      if (isFactusNotFoundError(error)) {
        throw new NotFoundError("Documento soporte no encontrado");
      }

      throw error;
    }

    // Remove from our DB only after Factus confirms deletion
    await db
      .delete(supportDocuments)
      .where(buildFilter(userId, credentialsId, id));
  },
};
