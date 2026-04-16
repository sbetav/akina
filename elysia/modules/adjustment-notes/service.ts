import { and, asc, eq } from "drizzle-orm";
import {
  type AdjustmentNote,
  type AdjustmentNoteReasonCode,
  type ApiResponse,
  type PaymentMethodCode,
  type ProductStandardId,
  type ViewAdjustmentNoteData,
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
import { isFactusNotFoundError } from "@/elysia/factus-errors";

// ─── Input types ──────────────────────────────────────────────────────────────

export interface AdjustmentNoteItemInput {
  codeReference: string;
  name: string;
  quantity: number;
  discountRate: number;
  price: number;
  unitMeasureId: number;
  standardCodeId: ProductStandardId;
}

export interface AdjustmentNoteCreateInput {
  /** Factus numeric ID of the parent support document. */
  supportDocumentFactusId: number;
  numberingRangeId?: number;
  correctionConceptCode: AdjustmentNoteReasonCode;
  paymentMethodCode?: PaymentMethodCode;
  observation?: string;
  sendEmail?: boolean;
  items: AdjustmentNoteItemInput[];
}

// ─── Result types ─────────────────────────────────────────────────────────────

export interface AdjustmentNoteRecordResult {
  id: string;
  supportDocumentId: string;
  number: string;
  status: number;
  providerName: string;
  providerIdentification: string;
  total: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Workspace filters ────────────────────────────────────────────────────────

const buildSupportDocumentFilter = createWorkspaceFilter(supportDocuments);
const buildAdjustmentNoteFilter = createWorkspaceFilter(adjustmentNotes);

// ─── Helpers ──────────────────────────────────────────────────────────────────


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

function generateAdjustmentNoteReferenceCode(): string {
  return `AKN-AN-${ulid()}`;
}

function normalizeRow(row: {
  id: string;
  supportDocumentId: string;
  number: string;
  status: number;
  providerName: string;
  providerIdentification: string;
  total: string | null;
  createdAt: Date;
  updatedAt: Date;
}): AdjustmentNoteRecordResult {
  return {
    id: row.id,
    supportDocumentId: row.supportDocumentId,
    number: row.number,
    status: row.status,
    providerName: row.providerName,
    providerIdentification: row.providerIdentification,
    total: row.total,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/**
 * Extracts persitable fields from the Factus AdjustmentNote list item response.
 * The `AdjustmentNote` type has provider info at the root level (no nested object).
 */
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

  // The create response has nested objects: root.adjustment_note and root.provider
  const adjustmentNote = getRecord(root?.adjustment_note);
  const provider = getRecord(root?.provider);

  const number = pickFirstString(adjustmentNote?.number);
  if (!number) {
    throw new Error("Factus no devolvió el número de la nota de ajuste creada");
  }

  const providerIdentification = pickFirstString(provider?.identification);
  if (!providerIdentification) {
    throw new Error("Factus no devolvió la identificación del proveedor");
  }

  const providerName = pickFirstString(
    provider?.graphic_representation_name,
    provider?.trade_name,
    provider?.company,
    provider?.names,
  );
  if (!providerName) {
    throw new Error("Factus no devolvió el nombre del proveedor");
  }

  return {
    number,
    referenceCode:
      pickFirstString(adjustmentNote?.reference_code) ?? fallbackReferenceCode,
    status: toFiniteNumber(adjustmentNote?.status) ?? 0,
    providerName,
    providerIdentification,
    total: toNumericString(adjustmentNote?.total),
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const AdjustmentNoteService = {
  async listForSupportDocument(
    userId: string,
    supportDocumentId: string,
  ): Promise<{ items: AdjustmentNoteRecordResult[] }> {
    const credentialsId = await getActiveCredentialsIdForUser(userId);

    // Verify the support document belongs to this user/workspace
    const supportDoc = await db.query.supportDocuments.findFirst({
      where: buildSupportDocumentFilter(
        userId,
        credentialsId,
        supportDocumentId,
      ),
      columns: { id: true },
    });

    if (!supportDoc) {
      throw new NotFoundError("Documento soporte no encontrado");
    }

    const rows = await db
      .select({
        id: adjustmentNotes.id,
        supportDocumentId: adjustmentNotes.supportDocumentId,
        number: adjustmentNotes.number,
        status: adjustmentNotes.status,
        providerName: adjustmentNotes.providerName,
        providerIdentification: adjustmentNotes.providerIdentification,
        total: adjustmentNotes.total,
        createdAt: adjustmentNotes.createdAt,
        updatedAt: adjustmentNotes.updatedAt,
      })
      .from(adjustmentNotes)
      .where(
        and(
          buildAdjustmentNoteFilter(userId, credentialsId),
          eq(adjustmentNotes.supportDocumentId, supportDocumentId),
        ),
      )
      .orderBy(asc(adjustmentNotes.createdAt));

    return { items: rows.map(normalizeRow) };
  },

  async create(
    userId: string,
    supportDocumentId: string,
    input: AdjustmentNoteCreateInput,
  ): Promise<AdjustmentNoteRecordResult> {
    const credentialsId = await getActiveCredentialsIdForUser(userId);

    // Verify ownership of the support document
    const supportDoc = await db.query.supportDocuments.findFirst({
      where: buildSupportDocumentFilter(
        userId,
        credentialsId,
        supportDocumentId,
      ),
      columns: { id: true },
    });

    if (!supportDoc) {
      throw new NotFoundError("Documento soporte no encontrado");
    }

    const client = await getFactusClientForUser(userId);

    const referenceCode = generateAdjustmentNoteReferenceCode();

    const items = input.items.map((item) => ({
      code_reference: item.codeReference,
      name: item.name,
      quantity: item.quantity,
      discount_rate: item.discountRate,
      price: item.price,
      unit_measure_id: item.unitMeasureId,
      standard_code_id: item.standardCodeId,
    }));

    let res: ApiResponse<AdjustmentNote>;
    try {
      res = await client.adjustmentNotes.create({
        reference_code: referenceCode,
        support_document_id: input.supportDocumentFactusId,
        numbering_range_id: input.numberingRangeId,
        correction_concept_code: input.correctionConceptCode,
        payment_method_code: input.paymentMethodCode,
        observation: input.observation,
        send_email: input.sendEmail,
        items,
      });
    } catch (error) {
      // Best-effort cleanup: delete from Factus to avoid blocking the reference code.
      if (error instanceof FactusError) {
        try {
          await client.adjustmentNotes.delete(referenceCode);
        } catch {
          // Ignore cleanup errors — keep the original Factus error.
        }
      }

      throw error;
    }

    const persisted = extractPersistableFields(res.data, referenceCode);

    try {
      const [row] = await db
        .insert(adjustmentNotes)
        .values({
          supportDocumentId,
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

      return normalizeRow(row);
    } catch (error) {
      // DB insert failed — clean up the Factus record to keep state consistent.
      try {
        await client.adjustmentNotes.delete(persisted.referenceCode);
      } catch {
        // Best-effort cleanup. Surface the DB failure.
      }

      throw error;
    }
  },

  async getFromFactus(
    userId: string,
    adjustmentNoteId: string,
  ): Promise<ViewAdjustmentNoteData> {
    const credentialsId = await getActiveCredentialsIdForUser(userId);

    const row = await db.query.adjustmentNotes.findFirst({
      where: buildAdjustmentNoteFilter(userId, credentialsId, adjustmentNoteId),
      columns: { number: true },
    });

    if (!row) {
      throw new NotFoundError("Nota de ajuste no encontrada");
    }

    const client = await getFactusClientForUser(userId);
    try {
      const res = await client.adjustmentNotes.get(row.number);
      return res.data;
    } catch (error) {
      if (isFactusNotFoundError(error)) {
        throw new NotFoundError("Nota de ajuste no encontrada");
      }

      throw error;
    }
  },

  async downloadPdf(
    userId: string,
    adjustmentNoteId: string,
  ): Promise<{ fileName: string; pdfBase64: string }> {
    const credentialsId = await getActiveCredentialsIdForUser(userId);

    const row = await db.query.adjustmentNotes.findFirst({
      where: buildAdjustmentNoteFilter(userId, credentialsId, adjustmentNoteId),
      columns: { number: true },
    });

    if (!row) {
      throw new NotFoundError("Nota de ajuste no encontrada");
    }

    const client = await getFactusClientForUser(userId);
    try {
      const res = await client.adjustmentNotes.downloadPdf(row.number);

      return {
        fileName: res.data.file_name,
        pdfBase64: res.data.pdf_base_64_encoded,
      };
    } catch (error) {
      if (isFactusNotFoundError(error)) {
        throw new NotFoundError("Nota de ajuste no encontrada");
      }

      throw error;
    }
  },

  async delete(userId: string, adjustmentNoteId: string): Promise<void> {
    const credentialsId = await getActiveCredentialsIdForUser(userId);

    const row = await db.query.adjustmentNotes.findFirst({
      where: buildAdjustmentNoteFilter(userId, credentialsId, adjustmentNoteId),
      columns: { referenceCode: true },
    });

    if (!row) {
      throw new NotFoundError("Nota de ajuste no encontrada");
    }

    const client = await getFactusClientForUser(userId);
    try {
      await client.adjustmentNotes.delete(row.referenceCode);
    } catch (error) {
      if (isFactusNotFoundError(error)) {
        throw new NotFoundError("Nota de ajuste no encontrada");
      }

      throw error;
    }

    await db
      .delete(adjustmentNotes)
      .where(
        buildAdjustmentNoteFilter(userId, credentialsId, adjustmentNoteId),
      );
  },
};
