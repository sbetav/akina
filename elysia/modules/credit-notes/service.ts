import { and, asc, eq } from "drizzle-orm";
import type {
  ApiResponse,
  CreditNoteCorrectionCode,
  CreditNoteListItem,
  CustomerTributeId,
  OrganizationTypeId,
  PaymentMethodCode,
  ProductStandardId,
  ViewBillData,
  ViewCreditNoteData,
} from "factus-js";
import { CreditNoteOperationTypeCode, FactusError } from "factus-js";
import { ulid } from "ulid";
import { db } from "@/db/drizzle";
import { creditNotes } from "@/db/schemas/credit-notes";
import { customers } from "@/db/schemas/customers";
import { invoices } from "@/db/schemas/invoices";
import { NotFoundError } from "@/elysia/errors";
import {
  createWorkspaceFilter,
  getActiveCredentialsIdForUser,
} from "@/elysia/workspace";
import { getFactusClientForUser } from "@/lib/factus";
import { buildFactusInvoiceItems } from "@/lib/invoices/factus";

export interface CreditNoteItemInput {
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

export interface CreditNoteCreateInput {
  numberingRangeId?: number;
  correctionConceptCode: CreditNoteCorrectionCode;
  observation?: string;
  paymentMethodCode: PaymentMethodCode;
  sendEmail?: boolean;
  items: CreditNoteItemInput[];
}

export interface CreditNoteRecordResult {
  id: string;
  invoiceId: string;
  number: string;
  status: number;
  customerName: string;
  customerIdentification: string;
  total: string | null;
  createdAt: string;
  updatedAt: string;
}

const buildInvoiceFilter = createWorkspaceFilter(invoices);
const buildCreditNoteFilter = createWorkspaceFilter(creditNotes);
const buildCustomerFilter = createWorkspaceFilter(customers);

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

function generateCreditNoteReferenceCode(): string {
  return `AKN-CN-${ulid()}`;
}

function normalizeRow(row: {
  id: string;
  invoiceId: string;
  number: string;
  status: number;
  customerName: string;
  customerIdentification: string;
  total: string | null;
  createdAt: Date;
  updatedAt: Date;
}): CreditNoteRecordResult {
  return {
    id: row.id,
    invoiceId: row.invoiceId,
    number: row.number,
    status: row.status,
    customerName: row.customerName,
    customerIdentification: row.customerIdentification,
    total: row.total,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
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
  const creditNote = getRecord(root?.credit_note);
  const customer = getRecord(root?.customer);

  const number = pickFirstString(root?.number, creditNote?.number);
  if (!number) {
    throw new Error("Factus no devolvio el numero de la nota credito creada");
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
      pickFirstString(root?.reference_code, creditNote?.reference_code) ??
      fallbackReferenceCode,
    status: toFiniteNumber(root?.status ?? creditNote?.status) ?? 0,
    customerName,
    customerIdentification,
    total: toNumericString(root?.total ?? creditNote?.total),
  };
}

async function getInvoiceContext(
  userId: string,
  invoiceId: string,
): Promise<{
  credentialsId: string | null;
  invoiceNumber: string;
  customerIdentification: string;
}> {
  const credentialsId = await getActiveCredentialsIdForUser(userId);

  const invoice = await db.query.invoices.findFirst({
    where: buildInvoiceFilter(userId, credentialsId, invoiceId),
    columns: {
      id: true,
      number: true,
      customerIdentification: true,
    },
  });

  if (!invoice) {
    throw new NotFoundError("Factura no encontrada");
  }

  return {
    credentialsId,
    invoiceNumber: invoice.number,
    customerIdentification: invoice.customerIdentification,
  };
}

export const CreditNoteService = {
  async listForInvoice(
    userId: string,
    invoiceId: string,
  ): Promise<{ items: CreditNoteRecordResult[] }> {
    const { credentialsId } = await getInvoiceContext(userId, invoiceId);

    const rows = await db
      .select({
        id: creditNotes.id,
        invoiceId: creditNotes.invoiceId,
        number: creditNotes.number,
        status: creditNotes.status,
        customerName: creditNotes.customerName,
        customerIdentification: creditNotes.customerIdentification,
        total: creditNotes.total,
        createdAt: creditNotes.createdAt,
        updatedAt: creditNotes.updatedAt,
      })
      .from(creditNotes)
      .where(
        and(
          buildCreditNoteFilter(userId, credentialsId),
          eq(creditNotes.invoiceId, invoiceId),
        ),
      )
      .orderBy(asc(creditNotes.createdAt));

    return { items: rows.map(normalizeRow) };
  },

  async create(
    userId: string,
    invoiceId: string,
    input: CreditNoteCreateInput,
  ): Promise<CreditNoteRecordResult> {
    const { credentialsId, invoiceNumber, customerIdentification } =
      await getInvoiceContext(userId, invoiceId);

    const client = await getFactusClientForUser(userId);

    let invoice: ViewBillData;
    try {
      const invoiceRes = await client.bills.get(invoiceNumber);
      invoice = invoiceRes.data;
    } catch (error) {
      if (isFactusNotFoundError(error)) {
        throw new NotFoundError("Factura no encontrada");
      }

      throw error;
    }

    const referenceCode = generateCreditNoteReferenceCode();
    const customerRow = await db.query.customers.findFirst({
      where: and(
        buildCustomerFilter(userId, credentialsId),
        eq(customers.identification, customerIdentification),
      ),
      columns: {
        identificationDocumentId: true,
        identification: true,
        dv: true,
        name: true,
        tradeName: true,
        address: true,
        email: true,
        phone: true,
        legalOrganizationId: true,
        tributeId: true,
        municipalityId: true,
      },
    });

    if (!customerRow) {
      throw new NotFoundError(
        "Cliente de la factura no encontrado en la base de datos",
      );
    }

    if (!customerRow.municipalityId) {
      throw new Error(
        "El cliente de la factura no tiene municipio configurado",
      );
    }

    const customer = {
      identification_document_id: customerRow.identificationDocumentId,
      identification: customerRow.identification,
      dv: customerRow.dv ?? undefined,
      company: customerRow.name,
      trade_name: customerRow.tradeName ?? undefined,
      names: customerRow.name,
      address: customerRow.address ?? "",
      email: customerRow.email ?? "",
      phone: customerRow.phone ?? "",
      legal_organization_id:
        customerRow.legalOrganizationId as OrganizationTypeId,
      tribute_id: customerRow.tributeId as CustomerTributeId,
      municipality_id: customerRow.municipalityId,
    };

    const items = buildFactusInvoiceItems(input.items);

    let res: ApiResponse<CreditNoteListItem>;
    try {
      res = await client.creditNotes.create({
        bill_id: invoice.bill.id,
        numbering_range_id: input.numberingRangeId,
        customization_id: CreditNoteOperationTypeCode.WithReference,
        correction_concept_code: input.correctionConceptCode,
        reference_code: referenceCode,
        observation: input.observation,
        payment_method_code: input.paymentMethodCode,
        send_email: input.sendEmail,
        customer,
        items,
      });
    } catch (error) {
      if (error instanceof FactusError) {
        try {
          await client.creditNotes.delete(referenceCode);
        } catch {
          // Best-effort cleanup. Keep the original Factus error.
        }
      }

      throw error;
    }

    const persisted = extractPersistableFields(res.data, referenceCode);

    try {
      const [row] = await db
        .insert(creditNotes)
        .values({
          invoiceId,
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

      return normalizeRow(row);
    } catch (error) {
      try {
        await client.creditNotes.delete(persisted.referenceCode);
      } catch {
        // Best-effort cleanup. Surface the DB failure.
      }

      throw error;
    }
  },

  async getFromFactus(
    userId: string,
    creditNoteId: string,
  ): Promise<ViewCreditNoteData> {
    const credentialsId = await getActiveCredentialsIdForUser(userId);

    const row = await db.query.creditNotes.findFirst({
      where: buildCreditNoteFilter(userId, credentialsId, creditNoteId),
      columns: { number: true },
    });

    if (!row) {
      throw new NotFoundError("Nota crédito no encontrada");
    }

    const client = await getFactusClientForUser(userId);
    try {
      const res = await client.creditNotes.get(row.number);
      return res.data;
    } catch (error) {
      if (isFactusNotFoundError(error)) {
        throw new NotFoundError("Nota crédito no encontrada");
      }

      throw error;
    }
  },

  async downloadPdf(
    userId: string,
    creditNoteId: string,
  ): Promise<{ fileName: string; pdfBase64: string }> {
    const credentialsId = await getActiveCredentialsIdForUser(userId);

    const row = await db.query.creditNotes.findFirst({
      where: buildCreditNoteFilter(userId, credentialsId, creditNoteId),
      columns: { number: true },
    });

    if (!row) {
      throw new NotFoundError("Nota crédito no encontrada");
    }

    const client = await getFactusClientForUser(userId);
    try {
      const res = await client.creditNotes.downloadPdf(row.number);

      return {
        fileName: res.data.file_name,
        pdfBase64: res.data.pdf_base_64_encoded,
      };
    } catch (error) {
      if (isFactusNotFoundError(error)) {
        throw new NotFoundError("Nota crédito no encontrada");
      }

      throw error;
    }
  },

  async delete(userId: string, creditNoteId: string): Promise<void> {
    const credentialsId = await getActiveCredentialsIdForUser(userId);

    const row = await db.query.creditNotes.findFirst({
      where: buildCreditNoteFilter(userId, credentialsId, creditNoteId),
      columns: { referenceCode: true },
    });

    if (!row) {
      throw new NotFoundError("Nota crédito no encontrada");
    }

    const client = await getFactusClientForUser(userId);
    try {
      await client.creditNotes.delete(row.referenceCode);
    } catch (error) {
      if (isFactusNotFoundError(error)) {
        throw new NotFoundError("Nota crédito no encontrada");
      }

      throw error;
    }

    await db
      .delete(creditNotes)
      .where(buildCreditNoteFilter(userId, credentialsId, creditNoteId));
  },
};
