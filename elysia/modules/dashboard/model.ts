import { t } from "elysia";

// ─── Summary ─────────────────────────────────────────────────────────────────

export const DashboardSummary = t.Object({
  totalInvoices: t.Number(),
  validatedInvoices: t.Number(),
  pendingInvoices: t.Number(),
  totalRevenue: t.Number(),
  totalCustomers: t.Number(),
  totalProducts: t.Number(),
  totalSupportDocuments: t.Number(),
});

// ─── Monthly revenue ─────────────────────────────────────────────────────────

export const DashboardMonthlyRevenueItem = t.Object({
  /** ISO-formatted month label, e.g. "2025-10" */
  month: t.String(),
  revenue: t.Number(),
  count: t.Number(),
});

// ─── Recent invoices ─────────────────────────────────────────────────────────

export const DashboardRecentInvoice = t.Object({
  id: t.String(),
  number: t.String(),
  status: t.Number(),
  customerName: t.String(),
  total: t.Union([t.String(), t.Null()]),
  createdAt: t.String(),
});

// ─── Top customers ───────────────────────────────────────────────────────────

export const DashboardTopCustomer = t.Object({
  customerName: t.String(),
  customerIdentification: t.String(),
  totalRevenue: t.Number(),
  invoiceCount: t.Number(),
});

// ─── Full response ───────────────────────────────────────────────────────────

export const DashboardMetricsResponse = t.Object({
  summary: DashboardSummary,
  monthlyRevenue: t.Array(DashboardMonthlyRevenueItem),
  recentInvoices: t.Array(DashboardRecentInvoice),
  topCustomers: t.Array(DashboardTopCustomer),
});
