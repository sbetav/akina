import { and, count, desc, ilike, inArray, or } from "drizzle-orm";
import type { SupportDocumentIdentityTypeId } from "factus-js";
import { db } from "@/db/drizzle";
import { providers } from "@/db/schemas/providers";
import { NotFoundError } from "@/elysia/errors";
import {
  createWorkspaceFilter,
  getActiveCredentialsIdForUser,
} from "@/elysia/workspace";
import { getSearchTerms } from "@/lib/utils";

// ─── Shared types ─────────────────────────────────────────────────────────────

export interface ProviderInput {
  identification: string;
  dv?: string;
  identificationDocumentId: SupportDocumentIdentityTypeId;
  names: string;
  tradeName?: string;
  countryCode: string;
  isResident?: 0 | 1;
  address?: string;
  email?: string;
  phone?: string;
  municipalityId?: string;
}

export interface ProviderDetailResult {
  id: string;
  identification: string;
  dv: string | null;
  identificationDocumentId: SupportDocumentIdentityTypeId;
  names: string;
  tradeName: string | null;
  countryCode: string | null;
  isResident: number | null;
  address: string | null;
  email: string | null;
  phone: string | null;
  municipalityId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderListResult {
  items: ProviderDetailResult[];
  total: number;
  page: number;
  limit: number;
}

// ─── Workspace filter ─────────────────────────────────────────────────────────

const buildFilter = createWorkspaceFilter(providers);

// ─── Service ─────────────────────────────────────────────────────────────────

export const ProviderService = {
  /**
   * Returns a paginated + searchable list of providers scoped to the active
   * workspace (userId + credentialsId). NULL credentialsId = Akina Sandbox.
   * Search is tokenized and matches partial terms against names OR
   * identification (case-insensitive), ignoring punctuation.
   */
  async list(
    userId: string,
    options: { search?: string; page?: number; limit?: number },
  ): Promise<ProviderListResult> {
    const credentialsId = await getActiveCredentialsIdForUser(userId);

    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const offset = (page - 1) * limit;

    const baseFilter = buildFilter(userId, credentialsId);

    const searchTerms = getSearchTerms(options.search);
    const searchFilter =
      searchTerms.length > 0
        ? or(
            ...searchTerms.flatMap((term) => [
              ilike(providers.names, `%${term}%`),
              ilike(providers.identification, `%${term}%`),
            ]),
          )
        : undefined;

    const whereClause = searchFilter
      ? and(baseFilter, searchFilter)
      : baseFilter;

    const [rows, [{ value: total }]] = await Promise.all([
      db
        .select({
          id: providers.id,
          identification: providers.identification,
          dv: providers.dv,
          identificationDocumentId: providers.identificationDocumentId,
          names: providers.names,
          tradeName: providers.tradeName,
          countryCode: providers.countryCode,
          isResident: providers.isResident,
          address: providers.address,
          email: providers.email,
          phone: providers.phone,
          municipalityId: providers.municipalityId,
          createdAt: providers.createdAt,
          updatedAt: providers.updatedAt,
        })
        .from(providers)
        .where(whereClause)
        .orderBy(desc(providers.createdAt))
        .limit(limit)
        .offset(offset),

      db.select({ value: count() }).from(providers).where(whereClause),
    ]);

    return {
      items: rows.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })),
      total: Number(total),
      page,
      limit,
    };
  },

  /**
   * Creates a new provider under the active workspace.
   * credentialsId = null when on the Akina Sandbox.
   */
  async create(userId: string, data: ProviderInput): Promise<void> {
    const credentialsId = await getActiveCredentialsIdForUser(userId);

    await db.insert(providers).values({
      credentialsId,
      userId,
      identification: data.identification,
      dv: data.dv ?? null,
      identificationDocumentId: data.identificationDocumentId,
      names: data.names,
      tradeName: data.tradeName ?? null,
      countryCode: data.countryCode,
      isResident: data.isResident ?? null,
      address: data.address ?? null,
      email: data.email ?? null,
      phone: data.phone ?? null,
      municipalityId: data.municipalityId ?? null,
    });
  },

  /**
   * Returns the full detail of a single provider.
   * Scoped to userId + active credentialsId — throws 404 if not found or not owned.
   */
  async get(userId: string, id: string): Promise<ProviderDetailResult> {
    const credentialsId = await getActiveCredentialsIdForUser(userId);

    const row = await db.query.providers.findFirst({
      where: buildFilter(userId, credentialsId, id),
    });

    if (!row) {
      throw new NotFoundError("Proveedor no encontrado");
    }

    return {
      id: row.id,
      identification: row.identification,
      dv: row.dv,
      identificationDocumentId: row.identificationDocumentId,
      names: row.names,
      tradeName: row.tradeName,
      countryCode: row.countryCode,
      isResident: row.isResident,
      address: row.address,
      email: row.email,
      phone: row.phone,
      municipalityId: row.municipalityId,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  },

  /**
   * Updates an existing provider.
   * Scoped to userId + active credentialsId — throws 404 if not found or not owned.
   */
  async update(userId: string, id: string, data: ProviderInput): Promise<void> {
    const credentialsId = await getActiveCredentialsIdForUser(userId);
    const filter = buildFilter(userId, credentialsId, id);

    const row = await db.query.providers.findFirst({
      where: filter,
      columns: { id: true },
    });

    if (!row) {
      throw new NotFoundError("Proveedor no encontrado");
    }

    await db
      .update(providers)
      .set({
        identification: data.identification,
        dv: data.dv ?? null,
        identificationDocumentId: data.identificationDocumentId,
        names: data.names,
        tradeName: data.tradeName ?? null,
        countryCode: data.countryCode,
        isResident: data.isResident ?? null,
        address: data.address ?? null,
        email: data.email ?? null,
        phone: data.phone ?? null,
        municipalityId: data.municipalityId ?? null,
        updatedAt: new Date(),
      })
      .where(filter);
  },

  /**
   * Deletes multiple or a single provider.
   * Scoped to userId + active credentialsId — only deletes rows the user owns.
   * Returns the number of rows actually deleted.
   */
  async delete(userId: string, ids: string[]): Promise<number> {
    if (ids.length === 0) return 0;

    const credentialsId = await getActiveCredentialsIdForUser(userId);
    const baseFilter = buildFilter(userId, credentialsId);

    const result = await db
      .delete(providers)
      .where(and(baseFilter, inArray(providers.id, ids)));

    return result.rowCount ?? 0;
  },
};
