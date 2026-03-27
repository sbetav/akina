import { betterAuth } from "@/lib/elysia/better-auth";
import { Elysia, t } from "elysia";
import {
  AcquirerQuery,
  AcquirerResponse,
  CredentialBody,
  CredentialDetail,
  CredentialListResponse,
  MunicipalitiesQuery,
  MunicipalityItem,
} from "./model";
import { FactusService } from "./service";

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
    async ({ user, body, status }) => {
      try {
        await FactusService.createCredential({
          userId: user.id,
          ...body,
        });
        return { success: true as const };
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Error al guardar las credenciales";
        return status(422, { error: message });
      }
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
    async ({ user, params, status }) => {
      try {
        return await FactusService.getCredential(user.id, params.id);
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Error al obtener la credencial";
        return status(404, { error: message });
      }
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
    async ({ user, params, body, status }) => {
      try {
        await FactusService.updateCredential(user.id, params.id, body);
        return { success: true as const };
      } catch (e) {
        const message =
          e instanceof Error
            ? e.message
            : "Error al actualizar las credenciales";
        return status(422, { error: message });
      }
    },
    {
      auth: true,
      params: t.Object({ id: t.String() }),
      body: CredentialBody,
      response: {
        200: t.Object({ success: t.Literal(true) }),
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
    async ({ user, params, status }) => {
      try {
        await FactusService.deleteCredential(user.id, params.id);
        return { success: true as const };
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Error al eliminar la credencial";
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
  )

  /**
   * PATCH /api/factus/credentials/:id/activate
   * Sets a credential as active (deactivates all others).
   * Use id "sandbox" to deactivate all and revert to Akina Sandbox.
   */
  .patch(
    "/credentials/:id/activate",
    async ({ user, params, status }) => {
      try {
        const id = params.id === "akina-sandbox" ? null : params.id;
        await FactusService.setActiveCredential(user.id, id);
        return { success: true as const };
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Error al activar la credencial";
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
  )

  // ─── Catalog ─────────────────────────────────────────────────────────────────

  /**
   * GET /api/factus/municipalities?name=...
   * Lists municipalities, optionally filtered by name.
   */
  .get(
    "/municipalities",
    async ({ user, query, status }) => {
      try {
        const data = await FactusService.getMunicipalities(user.id, query.name);
        return { data };
      } catch {
        return status(500, { error: "Error al obtener municipios" });
      }
    },
    {
      auth: true,
      query: MunicipalitiesQuery,
      response: {
        200: t.Object({ data: t.Array(MunicipalityItem) }),
        500: t.Object({ error: t.String() }),
      },
    },
  )

  /**
   * GET /api/factus/acquirer?identificationDocumentId=...&identificationNumber=...
   * Looks up an acquirer (customer) from the DIAN registry.
   */
  .get(
    "/acquirer",
    async ({ user, query, status }) => {
      try {
        const data = await FactusService.getAcquirer(
          user.id,
          query.identificationDocumentId,
          query.identificationNumber,
        );
        return data;
      } catch {
        return status(404, { error: "Adquiriente no encontrado" });
      }
    },
    {
      auth: true,
      query: AcquirerQuery,
      response: {
        200: AcquirerResponse,
        404: t.Object({ error: t.String() }),
      },
    },
  );

// Re-export types for client consumption
export type {
  CredentialDetailResult,
  CredentialListItem,
  FactusEnvironment,
} from "./service";
