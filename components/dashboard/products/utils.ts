import type { VariantProps } from "class-variance-authority";
import type { Tribute } from "factus-js";
import type { badgeVariants } from "@/components/ui/badge";

export { normalizeDiscountRate } from "@/lib/invoices/utils";

const tributeBadgePalette = [
  "teal",
  "cyan",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
] as const satisfies readonly NonNullable<
  VariantProps<typeof badgeVariants>["variant"]
>[];

export function tributeBadgeVariant(
  id: string,
): NonNullable<VariantProps<typeof badgeVariants>["variant"]> {
  const n = Number(id);
  if (!Number.isFinite(n) || n < 1) {
    return "info";
  }
  return tributeBadgePalette[(Math.trunc(n) - 1) % tributeBadgePalette.length];
}

export function formatRate(rate: number): string {
  if (rate === 0) return "0%";
  return `${+(rate * 100).toFixed(2)}%`;
}

export function formatPercentagePoints(percentage: number): string {
  if (percentage === 0) return "0%";
  return `${+percentage.toFixed(2)}%`;
}

export function getTributeLabel(
  tributes: Tribute[],
  tributeId: string,
): string {
  return (
    tributes.find((tribute) => tribute.id.toString() === tributeId)?.name ??
    tributeId
  );
}
