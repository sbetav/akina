import { Elysia, t } from "elysia";
import { betterAuth } from "@/elysia/better-auth";
import {
  CustomerBody,
  CustomerDetail,
  CustomerListQuery,
  CustomerListResponse,
} from "./model";
import { CustomerService } from "./service";

export const customersModule = new Elysia({ prefix: "/customers" })
  .use(betterAuth)

  // ─── List ─────────────────────────────────────────────────────────────────

  /**
   * GET /api/customers?search=&page=&limit=
   * Returns a paginated list of customers for the user's active credential.
   * Search tokenizes the query and matches partial terms against name or
   * identification number (case-insensitive), ignoring punctuation.
   */
  .get(
    "/",
    async ({ user, query }) => {
      return await CustomerService.list(user.id, {
        search: query.search,
        page: query.page,
        limit: query.limit,
      });
    },
    {
      auth: true,
      query: CustomerListQuery,
      response: {
        200: CustomerListResponse,
      },
    },
  )

  // ─── Create ───────────────────────────────────────────────────────────────

  /**
   * POST /api/customers
   * Creates a new customer under the user's active credential.
   */
  .post(
    "/",
    async ({ user, body }) => {
      await CustomerService.create(user.id, body);
      return { success: true as const };
    },
    {
      auth: true,
      body: CustomerBody,
      response: {
        200: t.Object({ success: t.Literal(true) }),
      },
    },
  )

  // ─── Delete ───────────────────────────────────────────────────────────────

  /**
   * DELETE /api/customers/bulk
   * Deletes multiple customers at once. Only deletes rows owned by the user.
   */
  .delete(
    "/",
    async ({ user, body }) => {
      const deleted = await CustomerService.delete(user.id, body.ids);
      return { success: true as const, deleted };
    },
    {
      auth: true,
      body: t.Object({ ids: t.Array(t.String(), { minItems: 1 }) }),
      response: {
        200: t.Object({ success: t.Literal(true), deleted: t.Number() }),
      },
    },
  )

  // ─── Single customer ──────────────────────────────────────────────────────

  /**
   * GET /api/customers/:id
   * Returns the full detail of a customer (for edit prefill).
   */
  .get(
    "/:id",
    async ({ user, params }) => {
      return await CustomerService.get(user.id, params.id);
    },
    {
      auth: true,
      params: t.Object({ id: t.String() }),
      response: {
        200: CustomerDetail,
        404: t.Object({ error: t.String() }),
      },
    },
  )

  /**
   * PUT /api/customers/:id
   * Updates an existing customer. Only the owning user can update it.
   */
  .put(
    "/:id",
    async ({ user, params, body }) => {
      await CustomerService.update(user.id, params.id, body);
      return { success: true as const };
    },
    {
      auth: true,
      params: t.Object({ id: t.String() }),
      body: CustomerBody,
      response: {
        200: t.Object({ success: t.Literal(true) }),
        404: t.Object({ error: t.String() }),
        422: t.Object({ error: t.String() }),
      },
    },
  );

// Re-export types for Eden client consumption
export type { CustomerDetailResult, CustomerListResult } from "./service";
