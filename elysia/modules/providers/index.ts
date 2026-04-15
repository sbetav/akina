import { Elysia, t } from "elysia";
import { betterAuth } from "@/elysia/better-auth";
import {
  ProviderBody,
  ProviderDetail,
  ProviderListQuery,
  ProviderListResponse,
} from "./model";
import { ProviderService } from "./service";

export const providersModule = new Elysia({ prefix: "/providers" })
  .use(betterAuth)

  // ─── List ─────────────────────────────────────────────────────────────────

  /**
   * GET /api/providers?search=&page=&limit=
   * Returns a paginated list of providers for the user's active credential.
   * Search tokenizes the query and matches partial terms against names or
   * identification number (case-insensitive), ignoring punctuation.
   */
  .get(
    "/",
    async ({ user, query }) => {
      return await ProviderService.list(user.id, {
        search: query.search,
        page: query.page,
        limit: query.limit,
      });
    },
    {
      auth: true,
      query: ProviderListQuery,
      response: {
        200: ProviderListResponse,
      },
    },
  )

  // ─── Create ───────────────────────────────────────────────────────────────

  /**
   * POST /api/providers
   * Creates a new provider under the user's active credential.
   */
  .post(
    "/",
    async ({ user, body }) => {
      await ProviderService.create(user.id, body);
      return { success: true as const };
    },
    {
      auth: true,
      body: ProviderBody,
      response: {
        200: t.Object({ success: t.Literal(true) }),
      },
    },
  )

  // ─── Delete ───────────────────────────────────────────────────────────────

  /**
   * DELETE /api/providers
   * Deletes multiple providers at once. Only deletes rows owned by the user.
   */
  .delete(
    "/",
    async ({ user, body }) => {
      const deleted = await ProviderService.delete(user.id, body.ids);
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

  // ─── Single provider ──────────────────────────────────────────────────────

  /**
   * GET /api/providers/:id
   * Returns the full detail of a provider (for edit prefill).
   */
  .get(
    "/:id",
    async ({ user, params }) => {
      return await ProviderService.get(user.id, params.id);
    },
    {
      auth: true,
      params: t.Object({ id: t.String() }),
      response: {
        200: ProviderDetail,
        404: t.Object({ error: t.String() }),
      },
    },
  )

  /**
   * PUT /api/providers/:id
   * Updates an existing provider. Only the owning user can update it.
   */
  .put(
    "/:id",
    async ({ user, params, body }) => {
      await ProviderService.update(user.id, params.id, body);
      return { success: true as const };
    },
    {
      auth: true,
      params: t.Object({ id: t.String() }),
      body: ProviderBody,
      response: {
        200: t.Object({ success: t.Literal(true) }),
        404: t.Object({ error: t.String() }),
        422: t.Object({ error: t.String() }),
      },
    },
  );

// Re-export types for Eden client consumption
export type { ProviderDetailResult, ProviderListResult } from "./service";
