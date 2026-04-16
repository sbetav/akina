import { and, asc, count, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { customers } from "@/db/schemas/customers";
import { invoices } from "@/db/schemas/invoices";
import { products } from "@/db/schemas/products";
import { supportDocuments } from "@/db/schemas/support-documents";
import {
  createWorkspaceFilter,
  getActiveCredentialsIdForUser,
} from "@/elysia/workspace";

// ─── Workspace filter builders ────────────────────────────────────────────────

const buildInvoicesFilter = createWorkspaceFilter(invoices);
const buildCustomersFilter = createWorkspaceFilter(customers);
const buildProductsFilter = createWorkspaceFilter(products);
const buildSupportDocumentsFilter = createWorkspaceFilter(supportDocuments);

// ─── Result types ─────────────────────────────────────────────────────────────

export interface DashboardSummaryResult {
  totalInvoices: number;
  validatedInvoices: number;
  pendingInvoices: number;
  totalRevenue: number;
  totalCustomers: number;
  totalProducts: number;
  totalSupportDocuments: number;
}

export interface DashboardMonthlyRevenueItem {
  month: string;
  revenue: number;
  count: number;
}

export interface DashboardRecentInvoice {
  id: string;
  number: string;
  status: number;
  customerName: string;
  total: string | null;
  createdAt: string;
}

export interface DashboardTopCustomer {
  customerName: string;
  customerIdentification: string;
  totalRevenue: number;
  invoiceCount: number;
}

export interface DashboardMetricsResult {
  summary: DashboardSummaryResult;
  monthlyRevenue: DashboardMonthlyRevenueItem[];
  recentInvoices: DashboardRecentInvoice[];
  topCustomers: DashboardTopCustomer[];
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const DashboardService = {
  /**
   * Aggregates dashboard metrics for the user's active workspace.
   * Runs all queries in parallel for minimal latency.
   *
   * Returns:
   * - summary counts (invoices, validated, revenue, customers, products, support docs)
   * - monthly revenue breakdown for the last 6 months
   * - last 5 invoices
   * - top 5 customers by total billed amount
   */
  async getMetrics(userId: string): Promise<DashboardMetricsResult> {
    const credentialsId = await getActiveCredentialsIdForUser(userId);

    const invoicesFilter = buildInvoicesFilter(userId, credentialsId);
    const validatedFilter = and(invoicesFilter, eq(invoices.status, 1));

    // Start of the current month 5 months ago → gives 6 full months of data
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const [
      totalInvoicesRows,
      validatedInvoicesRows,
      revenueRows,
      totalCustomersRows,
      totalProductsRows,
      totalSupportDocumentsRows,
      monthlyRevenueRows,
      recentInvoicesRows,
      topCustomersRows,
    ] = await Promise.all([
      // ── Total invoice count ────────────────────────────────────────────────
      db.select({ value: count() }).from(invoices).where(invoicesFilter),

      // ── Validated invoice count ────────────────────────────────────────────
      db.select({ value: count() }).from(invoices).where(validatedFilter),

      // ── Total revenue (sum of all invoice totals) ──────────────────────────
      db
        .select({
          value: sql<string>`COALESCE(SUM(${invoices.total}::numeric), 0)`,
        })
        .from(invoices)
        .where(invoicesFilter),

      // ── Customer count ─────────────────────────────────────────────────────
      db
        .select({ value: count() })
        .from(customers)
        .where(buildCustomersFilter(userId, credentialsId)),

      // ── Product count ──────────────────────────────────────────────────────
      db
        .select({ value: count() })
        .from(products)
        .where(buildProductsFilter(userId, credentialsId)),

      // ── Support document count ─────────────────────────────────────────────
      db
        .select({ value: count() })
        .from(supportDocuments)
        .where(buildSupportDocumentsFilter(userId, credentialsId)),

      // ── Monthly revenue for last 6 months ──────────────────────────────────
      db
        .select({
          month: sql<string>`TO_CHAR(DATE_TRUNC('month', ${invoices.createdAt}), 'YYYY-MM')`,
          revenue: sql<string>`COALESCE(SUM(${invoices.total}::numeric), 0)`,
          invoiceCount: sql<number>`COUNT(*)::int`,
        })
        .from(invoices)
        .where(and(invoicesFilter, gte(invoices.createdAt, sixMonthsAgo)))
        .groupBy(sql`DATE_TRUNC('month', ${invoices.createdAt})`)
        .orderBy(asc(sql`DATE_TRUNC('month', ${invoices.createdAt})`)),

      // ── Last 5 invoices ────────────────────────────────────────────────────
      db
        .select({
          id: invoices.id,
          number: invoices.number,
          status: invoices.status,
          customerName: invoices.customerName,
          total: invoices.total,
          createdAt: invoices.createdAt,
        })
        .from(invoices)
        .where(invoicesFilter)
        .orderBy(desc(invoices.createdAt))
        .limit(5),

      // ── Top 5 customers by total billed ───────────────────────────────────
      db
        .select({
          customerName: invoices.customerName,
          customerIdentification: invoices.customerIdentification,
          totalRevenue: sql<string>`COALESCE(SUM(${invoices.total}::numeric), 0)`,
          invoiceCount: sql<number>`COUNT(*)::int`,
        })
        .from(invoices)
        .where(invoicesFilter)
        .groupBy(invoices.customerName, invoices.customerIdentification)
        .orderBy(desc(sql`SUM(${invoices.total}::numeric)`))
        .limit(5),
    ]);

    const totalInvoices = Number(totalInvoicesRows[0]?.value ?? 0);
    const validatedInvoices = Number(validatedInvoicesRows[0]?.value ?? 0);

    return {
      summary: {
        totalInvoices,
        validatedInvoices,
        pendingInvoices: totalInvoices - validatedInvoices,
        totalRevenue: Number(revenueRows[0]?.value ?? 0),
        totalCustomers: Number(totalCustomersRows[0]?.value ?? 0),
        totalProducts: Number(totalProductsRows[0]?.value ?? 0),
        totalSupportDocuments: Number(totalSupportDocumentsRows[0]?.value ?? 0),
      },
      monthlyRevenue: monthlyRevenueRows.map((row) => ({
        month: row.month,
        revenue: Number(row.revenue),
        count: Number(row.invoiceCount),
      })),
      recentInvoices: recentInvoicesRows.map((row) => ({
        id: row.id,
        number: row.number,
        status: row.status,
        customerName: row.customerName,
        total: row.total,
        createdAt: row.createdAt.toISOString(),
      })),
      topCustomers: topCustomersRows.map((row) => ({
        customerName: row.customerName,
        customerIdentification: row.customerIdentification,
        totalRevenue: Number(row.totalRevenue),
        invoiceCount: Number(row.invoiceCount),
      })),
    };
  },
};
