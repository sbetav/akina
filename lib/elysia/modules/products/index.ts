import { betterAuth } from "@/lib/elysia/better-auth";
import { Elysia, t } from "elysia";
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
    async ({ user, status }) => {
      try {
        const code = await ProductService.nextCode(user.id);
        return { code };
      } catch (e) {
        const message =
          e instanceof Error
            ? e.message
            : "Error al generar el código de producto";
        return status(422, { error: message });
      }
    },
    {
      auth: true,
      response: {
        200: t.Object({ code: t.String() }),
        422: t.Object({ error: t.String() }),
      },
    },
  )
  .get(
    "/code-available",
    async ({ user, query, status }) => {
      try {
        const available = await ProductService.isCodeAvailable(
          user.id,
          query.code,
        );
        return { available };
      } catch (e) {
        const message =
          e instanceof Error
            ? e.message
            : "Error al validar disponibilidad del código";
        return status(500, { error: message });
      }
    },
    {
      auth: true,
      query: ProductCodeAvailabilityQuery,
      response: {
        200: t.Object({ available: t.Boolean() }),
        500: t.Object({ error: t.String() }),
      },
    },
  )

  // ─── List ─────────────────────────────────────────────────────────────────

  /**
   * GET /api/products?search=&page=&limit=
   * Returns a paginated list of products for the user's active credential.
   * Search matches against name or code (case-insensitive).
   */
  .get(
    "/",
    async ({ user, query, status }) => {
      try {
        return await ProductService.list(user.id, {
          search: query.search,
          page: query.page,
          limit: query.limit,
        });
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Error al obtener los productos";
        return status(422, { error: message });
      }
    },
    {
      auth: true,
      query: ProductListQuery,
      response: {
        200: ProductListResponse,
        422: t.Object({ error: t.String() }),
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
    async ({ user, body, status }) => {
      try {
        await ProductService.create(user.id, body);
        return { success: true as const };
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Error al crear el producto";
        return status(422, { error: message });
      }
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
    async ({ user, body, status }) => {
      try {
        const deleted = await ProductService.delete(user.id, body.ids);
        return { success: true as const, deleted };
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Error al eliminar los productos";
        return status(422, { error: message });
      }
    },
    {
      auth: true,
      body: t.Object({ ids: t.Array(t.String(), { minItems: 1 }) }),
      response: {
        200: t.Object({ success: t.Literal(true), deleted: t.Number() }),
        422: t.Object({ error: t.String() }),
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
    async ({ user, params, status }) => {
      try {
        return await ProductService.get(user.id, params.id);
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Error al obtener el producto";
        return status(404, { error: message });
      }
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
    async ({ user, params, body, status }) => {
      try {
        await ProductService.update(user.id, params.id, body);
        return { success: true as const };
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Error al actualizar el producto";
        return status(422, { error: message });
      }
    },
    {
      auth: true,
      params: t.Object({ id: t.String() }),
      body: ProductBody,
      response: {
        200: t.Object({ success: t.Literal(true) }),
        422: t.Object({ error: t.String() }),
      },
    },
  );
