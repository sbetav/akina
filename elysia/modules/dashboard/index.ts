import { Elysia } from "elysia";
import { betterAuth } from "@/elysia/better-auth";
import { DashboardMetricsResponse } from "./model";
import { DashboardService } from "./service";

export const dashboardModule = new Elysia({ prefix: "/dashboard" })
  .use(betterAuth)

  /**
   * GET /api/dashboard/metrics
   * Returns aggregated metrics for the current user's active workspace:
   * summary counts, monthly revenue (last 6 months), recent invoices, top customers.
   */
  .get(
    "/metrics",
    async ({ user }) => {
      return await DashboardService.getMetrics(user.id);
    },
    {
      auth: true,
      response: {
        200: DashboardMetricsResponse,
      },
    },
  );
