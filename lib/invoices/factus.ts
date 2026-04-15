import type { CreateBillInput, ProductStandardId } from "factus-js";
import { getInvoiceLineTax, normalizeDiscountRate } from "@/lib/invoices/utils";

type FactusBillItem = CreateBillInput["items"][number];

interface FactusInvoiceItemInput {
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

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function toTaxRateString(rate: number): string {
  return (rate * 100).toFixed(2);
}

export function getFactusItemPrice(item: FactusInvoiceItemInput): number {
  return roundMoney(item.price + getInvoiceLineTax({ ...item, quantity: 1 }));
}

export function buildFactusInvoiceItems(
  items: FactusInvoiceItemInput[],
): CreateBillInput["items"] {
  return items.map(
    (item): FactusBillItem => ({
      code_reference: item.code,
      name: item.name,
      quantity: item.quantity,
      discount_rate: normalizeDiscountRate(item.discountRate),
      // Factus expects the unit price including taxes, while discounts travel
      // separately in `discount_rate`.
      price: getFactusItemPrice(item),
      tax_rate: toTaxRateString(item.taxRate),
      unit_measure_id: Number(item.unitMeasureId),
      standard_code_id: item.standardCodeId,
      is_excluded: item.isExcluded ? 1 : 0,
      tribute_id: Number(item.tributeId),
    }),
  );
}
