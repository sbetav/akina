import { Elysia, t } from "elysia";
import { betterAuth } from "@/elysia/better-auth";
import { ForbiddenError } from "@/elysia/errors";
import { AKINA_SANDBOX_ID } from "@/lib/constants";
import { isUsingSharedAkinaSandbox } from "@/lib/factus";
import {
  AcquirerQuery,
  AcquirerResponse,
  CredentialBody,
  CredentialDetail,
  CredentialListResponse,
  MeasurementUnitItem,
  MunicipalitiesQuery,
  MunicipalityItem,
  NumberingRangeCreateBody,
  NumberingRangeCatalogResponse,
  NumberingRangeItem,
  NumberingRangeListQuery,
  NumberingRangeListResponse,
  NumberingRangeUpdateCurrentBody,
  TributeItem,
} from "./model";
import { FactusService } from "./service";

const SANDBOX_NUMBERING_MUTATION_FORBIDDEN =
  "No puedes crear, actualizar ni eliminar rangos de numeración con las credenciales de Akina Sandbox.";

export const factusModule = new Elysia({ prefix: "/factus" })
  .use(betterAuth)

  // ─── Credential list ────────────────────────────────────────────────────────

  /**
   * GET /api/factus/credentials
   * Returns all credential sets for the current user with live validity status.
   * Invalid credentials are sorted to the end of the list.
   */
  .get(
    "/credentials",
    async ({ user, status }) => {
      try {
        const items = await FactusService.listCredentials(user.id);
        return { items };
      } catch {
        return status(500, { error: "Error al obtener las credenciales" });
      }
    },
    {
      auth: true,
      response: {
        200: CredentialListResponse,
        500: t.Object({ error: t.String() }),
      },
    },
  )

  /**
   * POST /api/factus/credentials
   * Validates and creates a new credential set.
   * The first credential added is automatically set as active.
   */
  .post(
    "/credentials",
    async ({ user, body }) => {
      await FactusService.createCredential({
        userId: user.id,
        ...body,
      });
      return { success: true as const };
    },
    {
      auth: true,
      body: CredentialBody,
      response: {
        200: t.Object({ success: t.Literal(true) }),
        422: t.Object({ error: t.String() }),
      },
    },
  )

  // ─── Single credential ──────────────────────────────────────────────────────

  /**
   * GET /api/factus/credentials/:id
   * Returns the full credential detail including decrypted secrets (for edit prefill).
   */
  .get(
    "/credentials/:id",
    async ({ user, params }) => {
      return await FactusService.getCredential(user.id, params.id);
    },
    {
      auth: true,
      params: t.Object({ id: t.String() }),
      response: {
        200: CredentialDetail,
        404: t.Object({ error: t.String() }),
      },
    },
  )

  /**
   * PUT /api/factus/credentials/:id
   * Validates and updates an existing credential set.
   */
  .put(
    "/credentials/:id",
    async ({ user, params, body }) => {
      await FactusService.updateCredential(user.id, params.id, body);
      return { success: true as const };
    },
    {
      auth: true,
      params: t.Object({ id: t.String() }),
      body: CredentialBody,
      response: {
        200: t.Object({ success: t.Literal(true) }),
        404: t.Object({ error: t.String() }),
        422: t.Object({ error: t.String() }),
      },
    },
  )

  /**
   * DELETE /api/factus/credentials/:id
   * Deletes a credential set. Falls back to Akina Sandbox if it was active.
   */
  .delete(
    "/credentials/:id",
    async ({ user, params }) => {
      await FactusService.deleteCredential(user.id, params.id);
      return { success: true as const };
    },
    {
      auth: true,
      params: t.Object({ id: t.String() }),
      response: {
        200: t.Object({ success: t.Literal(true) }),
        404: t.Object({ error: t.String() }),
        422: t.Object({ error: t.String() }),
      },
    },
  )

  /**
   * PATCH /api/factus/credentials/:id/activate
   * Sets a credential as active (deactivates all others).
   * Use id "sandbox" to deactivate all and revert to Akina Sandbox.
   * Returns the same credential list shape as GET /credentials.
   */
  .patch(
    "/credentials/:id/activate",
    async ({ user, params }) => {
      const id = params.id === AKINA_SANDBOX_ID ? null : params.id;
      await FactusService.setActiveCredential(user.id, id);
      const items = await FactusService.listCredentials(user.id);
      return { items };
    },
    {
      auth: true,
      params: t.Object({ id: t.String() }),
      response: {
        200: CredentialListResponse,
        404: t.Object({ error: t.String() }),
        422: t.Object({ error: t.String() }),
      },
    },
  )

  // ─── Catalog ─────────────────────────────────────────────────────────────────

  /**
   * GET /api/factus/municipalities?name=...
   * Lists municipalities, optionally filtered by name.
   */
  .get(
    "/municipalities",
    async ({ user, query }) => {
      const data = await FactusService.getMunicipalities(user.id, query.name);
      return { data };
    },
    {
      auth: true,
      query: MunicipalitiesQuery,
      response: {
        200: t.Object({ data: t.Array(MunicipalityItem) }),
      },
    },
  )

  /**
   * GET /api/factus/acquirer?identificationDocumentId=...&identificationNumber=...
   * Looks up an acquirer (customer) from the DIAN registry.
   */
  .get(
    "/acquirer",
    async ({ user, query }) => {
      const data = await FactusService.getAcquirer(
        user.id,
        query.identificationDocumentId,
        query.identificationNumber,
      );
      return data;
    },
    {
      auth: true,
      query: AcquirerQuery,
      response: {
        200: AcquirerResponse,
        404: t.Object({ error: t.String() }),
      },
    },
  )

  /**
   * GET /api/factus/measurement-units
   * Returns all measurement units from the active Factus client.
   */
  .get(
    "/measurement-units",
    async ({ user }) => {
      const data = await FactusService.getMeasurementUnits(user.id);
      return { data };
    },
    {
      auth: true,
      response: {
        200: t.Object({ data: t.Array(MeasurementUnitItem) }),
      },
    },
  )

  /**
   * GET /api/factus/tributes
   * Returns all product tributes from the active Factus client.
   */
  .get(
    "/tributes",
    async ({ user }) => {
      const data = await FactusService.getTributes(user.id);
      return { data };
    },
    {
      auth: true,
      response: {
        200: t.Object({ data: t.Array(TributeItem) }),
      },
    },
  )

  // ─── Numbering ranges ───────────────────────────────────────────────────────

  /**
   * GET /api/factus/numbering-ranges
   * Lists numbering ranges with optional filters and pagination.
   */
  .get(
    "/numbering-ranges",
    async ({ user, query }) => {
      return await FactusService.listNumberingRanges(user.id, query);
    },
    {
      auth: true,
      query: NumberingRangeListQuery,
      response: {
        200: NumberingRangeListResponse,
      },
    },
  )

  /**
   * GET /api/factus/numbering-ranges/catalog
   * Lists all numbering ranges for selection controls (non-paginated).
   */
  .get(
    "/numbering-ranges/catalog",
    async ({ user }) => {
      const data = await FactusService.listAllNumberingRanges(user.id);
      return { data };
    },
    {
      auth: true,
      response: {
        200: NumberingRangeCatalogResponse,
      },
    },
  )

  /**
   * POST /api/factus/numbering-ranges
   * Creates a new numbering range.
   */
  .post(
    "/numbering-ranges",
    async ({ user, body }) => {
      if (await isUsingSharedAkinaSandbox(user.id)) {
        throw new ForbiddenError(SANDBOX_NUMBERING_MUTATION_FORBIDDEN);
      }

      const data = await FactusService.createNumberingRange(user.id, body);
      return { data };
    },
    {
      auth: true,
      body: NumberingRangeCreateBody,
      response: {
        200: t.Object({ data: NumberingRangeItem }),
        403: t.Object({ error: t.String() }),
      },
    },
  )

  /**
   * DELETE /api/factus/numbering-ranges/:id
   * Deletes a numbering range by id.
   */
  .delete(
    "/numbering-ranges/:id",
    async ({ user, params }) => {
      if (await isUsingSharedAkinaSandbox(user.id)) {
        throw new ForbiddenError(SANDBOX_NUMBERING_MUTATION_FORBIDDEN);
      }

      await FactusService.deleteNumberingRange(user.id, params.id);
      return { success: true as const };
    },
    {
      auth: true,
      params: t.Object({ id: t.Numeric({ minimum: 1 }) }),
      response: {
        200: t.Object({ success: t.Literal(true) }),
        403: t.Object({ error: t.String() }),
      },
    },
  )

  /**
   * PATCH /api/factus/numbering-ranges/:id/current
   * Updates the current consecutive number for a numbering range.
   */
  .patch(
    "/numbering-ranges/:id/current",
    async ({ user, params, body }) => {
      if (await isUsingSharedAkinaSandbox(user.id)) {
        throw new ForbiddenError(SANDBOX_NUMBERING_MUTATION_FORBIDDEN);
      }

      const data = await FactusService.updateNumberingRangeCurrent(
        user.id,
        params.id,
        body.current,
      );
      return { data };
    },
    {
      auth: true,
      params: t.Object({ id: t.Numeric({ minimum: 1 }) }),
      body: NumberingRangeUpdateCurrentBody,
      response: {
        200: t.Object({ data: NumberingRangeItem }),
        403: t.Object({ error: t.String() }),
      },
    },
  );
