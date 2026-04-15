export interface InvoiceCalculationItem {
  price: number;
  quantity: number;
  discountRate: number;
  taxRate: number;
  isExcluded: boolean;
}

export interface InvoiceTotals {
  subtotal: number;
  taxes: number;
  discountTotal: number;
  total: number;
}

export type InvoiceStatusDisplay = {
  label: string;
  variant: "warning" | "default";
};

export const invoiceStatusConfig: Record<number, InvoiceStatusDisplay> = {
  0: { label: "Pendiente", variant: "warning" },
  1: { label: "Validada", variant: "default" },
};

export function normalizeDiscountRate(discountRate: number): number {
  if (discountRate > 0 && discountRate <= 1) {
    return discountRate * 100;
  }
  return discountRate;
}

export function getInvoiceLineBase(item: InvoiceCalculationItem): number {
  const discountRate = normalizeDiscountRate(item.discountRate);
  return item.price * item.quantity * (1 - discountRate / 100);
}

export function getInvoiceLineTax(item: InvoiceCalculationItem): number {
  if (item.isExcluded) return 0;
  return getInvoiceLineBase(item) * item.taxRate;
}

export function getInvoiceLineDiscount(item: InvoiceCalculationItem): number {
  const discountRate = normalizeDiscountRate(item.discountRate);
  return item.price * item.quantity * (discountRate / 100);
}

export function getInvoiceLineTotal(item: InvoiceCalculationItem): number {
  return getInvoiceLineBase(item) + getInvoiceLineTax(item);
}

export function getInvoiceTotals(
  items: InvoiceCalculationItem[],
): InvoiceTotals {
  return items.reduce<InvoiceTotals>(
    (acc, item) => {
      acc.subtotal += getInvoiceLineBase(item);
      acc.taxes += getInvoiceLineTax(item);
      acc.discountTotal += getInvoiceLineDiscount(item);
      acc.total += getInvoiceLineTotal(item);
      return acc;
    },
    { subtotal: 0, taxes: 0, discountTotal: 0, total: 0 },
  );
}

export function getInvoiceStatusDisplay(status: number): InvoiceStatusDisplay {
  return (
    invoiceStatusConfig[status] ?? {
      label: String(status),
      variant: "warning",
    }
  );
}
