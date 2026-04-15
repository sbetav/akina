import { formatDate } from "date-fns";
import { es } from "date-fns/locale";
import type { ViewBillData, ViewCreditNoteData } from "factus-js";
import { COP } from "@/lib/utils";

export function formatDocumentCurrency(
  value: string | number | null | undefined,
): string {
  const numeric = typeof value === "string" ? Number(value) : value;
  if (typeof numeric !== "number" || !Number.isFinite(numeric)) return "N/A";
  return COP.format(numeric);
}

export function formatDocumentDate(value?: string | null): string {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return formatDate(date, "d 'de' MMMM 'de' yyyy", { locale: es });
}

export function getBillCustomerName(invoice: ViewBillData): string {
  return (
    invoice.customer.graphic_representation_name ||
    invoice.customer.trade_name ||
    invoice.customer.company ||
    invoice.customer.names ||
    "N/A"
  );
}

export function getCreditNoteCustomerName(
  creditNote: ViewCreditNoteData,
): string {
  return (
    creditNote.customer.graphic_representation_name ||
    creditNote.customer.trade_name ||
    creditNote.customer.company ||
    creditNote.customer.names ||
    "N/A"
  );
}

export function getDocumentValidationStatus(status: number): {
  label: string;
  variant: "warning" | "default";
} {
  return status === 1
    ? { label: "Validada", variant: "default" }
    : { label: "Pendiente", variant: "warning" };
}
