import { Elysia, t } from "elysia";
import { betterAuth } from "@/elysia/better-auth";
import {
  ProductBody,
  ProductCodeAvailabilityQuery,
  ProductDetail,
  ProductListQuery,
  ProductListResponse,
} from "./model";
import { ProductService } from "./service";

export const productsModule = new Elysia({ prefix: "/products" })
  .use(betterAuth)

  // ─── Next code ────────────────────────────────────────────────────────────

  /**
   * GET /api/products/next-code
   * Returns the next auto-generated product code for the active workspace.
   * Useful for pre-filling the code field before creating a product.
   * Must be defined before /:id to avoid route shadowing.
   */
  .get(
    "/next-code",
    async ({ user }) => {
      const code = await ProductService.nextCode(user.id);
      return { code };
    },
    {
      auth: true,
      response: {
        200: t.Object({ code: t.String() }),
      },
    },
  )
  .get(
    "/code-available",
    async ({ user, query }) => {
      const available = await ProductService.isCodeAvailable(
        user.id,
        query.code,
      );
      return { available };
    },
    {
      auth: true,
      query: ProductCodeAvailabilityQuery,
      response: {
        200: t.Object({ available: t.Boolean() }),
      },
    },
  )

  // ─── List ─────────────────────────────────────────────────────────────────

  /**
   * GET /api/products?search=&page=&limit=
   * Returns a paginated list of products for the user's active credential.
   * Search tokenizes the query and matches partial terms against name or
   * code (case-insensitive), ignoring punctuation.
   */
  .get(
    "/",
    async ({ user, query }) => {
      return await ProductService.list(user.id, {
        search: query.search,
        page: query.page,
        limit: query.limit,
      });
    },
    {
      auth: true,
      query: ProductListQuery,
      response: {
        200: ProductListResponse,
      },
    },
  )

  // ─── Create ───────────────────────────────────────────────────────────────

  /**
   * POST /api/products
   * Creates a new product under the user's active credential.
   */
  .post(
    "/",
    async ({ user, body }) => {
      await ProductService.create(user.id, body);
      return { success: true as const };
    },
    {
      auth: true,
      body: ProductBody,
      response: {
        200: t.Object({ success: t.Literal(true) }),
        422: t.Object({ error: t.String() }),
      },
    },
  )

  // ─── Delete ───────────────────────────────────────────────────────────────

  /**
   * DELETE /api/products
   * Deletes multiple products at once. Only deletes rows owned by the user.
   */
  .delete(
    "/",
    async ({ user, body }) => {
      const deleted = await ProductService.delete(user.id, body.ids);
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

  // ─── Single product ───────────────────────────────────────────────────────

  /**
   * GET /api/products/:id
   * Returns the full detail of a product (for edit prefill).
   */
  .get(
    "/:id",
    async ({ user, params }) => {
      return await ProductService.get(user.id, params.id);
    },
    {
      auth: true,
      params: t.Object({ id: t.String() }),
      response: {
        200: ProductDetail,
        404: t.Object({ error: t.String() }),
      },
    },
  )

  /**
   * PUT /api/products/:id
   * Updates an existing product. Only the owning user can update it.
   */
  .put(
    "/:id",
    async ({ user, params, body }) => {
      await ProductService.update(user.id, params.id, body);
      return { success: true as const };
    },
    {
      auth: true,
      params: t.Object({ id: t.String() }),
      body: ProductBody,
      response: {
        200: t.Object({ success: t.Literal(true) }),
        404: t.Object({ error: t.String() }),
        422: t.Object({ error: t.String() }),
      },
    },
  );
