import { betterAuth } from "@/lib/elysia/better-auth";
import { Elysia, t } from "elysia";
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
   * Search matches against name or identification number (case-insensitive).
   */
  .get(
    "/",
    async ({ user, query, status }) => {
      try {
        return await CustomerService.list(user.id, {
          search: query.search,
          page: query.page,
          limit: query.limit,
        });
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Error al obtener los clientes";
        return status(422, { error: message });
      }
    },
    {
      auth: true,
      query: CustomerListQuery,
      response: {
        200: CustomerListResponse,
        422: t.Object({ error: t.String() }),
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
    async ({ user, body, status }) => {
      try {
        await CustomerService.create(user.id, body);
        return { success: true as const };
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Error al crear el cliente";
        return status(422, { error: message });
      }
    },
    {
      auth: true,
      body: CustomerBody,
      response: {
        200: t.Object({ success: t.Literal(true) }),
        422: t.Object({ error: t.String() }),
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
    async ({ user, params, status }) => {
      try {
        return await CustomerService.get(user.id, params.id);
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Error al obtener el cliente";
        return status(404, { error: message });
      }
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
    async ({ user, params, body, status }) => {
      try {
        await CustomerService.update(user.id, params.id, body);
        return { success: true as const };
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Error al actualizar el cliente";
        return status(422, { error: message });
      }
    },
    {
      auth: true,
      params: t.Object({ id: t.String() }),
      body: CustomerBody,
      response: {
        200: t.Object({ success: t.Literal(true) }),
        422: t.Object({ error: t.String() }),
      },
    },
  )

  /**
   * DELETE /api/customers/:id
   * Deletes a customer. Only the owning user can delete it.
   */
  .delete(
    "/:id",
    async ({ user, params, status }) => {
      try {
        await CustomerService.delete(user.id, params.id);
        return { success: true as const };
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Error al eliminar el cliente";
        return status(422, { error: message });
      }
    },
    {
      auth: true,
      params: t.Object({ id: t.String() }),
      response: {
        200: t.Object({ success: t.Literal(true) }),
        422: t.Object({ error: t.String() }),
      },
    },
  );

// Re-export types for Eden client consumption
export type {
  CustomerDetailResult,
  CustomerListItem,
  CustomerListResult,
} from "./service";
