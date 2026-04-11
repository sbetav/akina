import { and, count, desc, ilike, inArray, or } from "drizzle-orm";
import type {
  CustomerTributeId,
  IdentityDocumentTypeId,
  OrganizationTypeId,
} from "factus-js";
import { db } from "@/db/drizzle";
import { customers } from "@/db/schemas/customers";
import { NotFoundError } from "@/elysia/errors";
import {
  createWorkspaceFilter,
  getActiveCredentialsIdForUser,
} from "@/elysia/workspace";

// ─── Shared types ─────────────────────────────────────────────────────────────

export interface CustomerInput {
  identification: string;
  dv?: string;
  identificationDocumentId: IdentityDocumentTypeId;
  legalOrganizationId: OrganizationTypeId;
  tributeId: CustomerTributeId;
  name: string;
  tradeName?: string;
  address?: string;
  email?: string;
  phone?: string;
  municipalityId?: string;
}

export interface CustomerListItem {
  id: string;
  identification: string;
  dv: string | null;
  identificationDocumentId: IdentityDocumentTypeId;
  name: string;
  email: string | null;
  phone: string | null;
  municipalityId: string | null;
  createdAt: string;
}

export interface CustomerDetailResult {
  id: string;
  identification: string;
  dv: string | null;
  identificationDocumentId: IdentityDocumentTypeId;
  legalOrganizationId: OrganizationTypeId;
  tributeId: CustomerTributeId;
  name: string;
  tradeName: string | null;
  address: string | null;
  email: string | null;
  phone: string | null;
  municipalityId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerListResult {
  items: CustomerListItem[];
  total: number;
  page: number;
  limit: number;
}

// ─── Workspace filter ─────────────────────────────────────────────────────────

const buildFilter = createWorkspaceFilter(customers);

// ─── Service ─────────────────────────────────────────────────────────────────

export const CustomerService = {
  /**
   * Returns a paginated + searchable list of customers scoped to the active
   * workspace (userId + credentialsId). NULL credentialsId = Akina Sandbox.
   * Search matches against name OR identification (case-insensitive).
   */
  async list(
    userId: string,
    options: { search?: string; page?: number; limit?: number },
  ): Promise<CustomerListResult> {
    const credentialsId = await getActiveCredentialsIdForUser(userId);

    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const offset = (page - 1) * limit;

    const baseFilter = buildFilter(userId, credentialsId);

    const whereClause =
      options.search && options.search.trim().length > 0
        ? and(
            baseFilter,
            or(
              ilike(customers.name, `%${options.search.trim()}%`),
              ilike(customers.identification, `%${options.search.trim()}%`),
            ),
          )
        : baseFilter;

    const [rows, [{ value: total }]] = await Promise.all([
      db
        .select({
          id: customers.id,
          identification: customers.identification,
          dv: customers.dv,
          identificationDocumentId: customers.identificationDocumentId,
          name: customers.name,
          email: customers.email,
          phone: customers.phone,
          municipalityId: customers.municipalityId,
          createdAt: customers.createdAt,
        })
        .from(customers)
        .where(whereClause)
        .orderBy(desc(customers.createdAt))
        .limit(limit)
        .offset(offset),

      db.select({ value: count() }).from(customers).where(whereClause),
    ]);

    return {
      items: rows.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
      })),
      total: Number(total),
      page,
      limit,
    };
  },

  /**
   * Creates a new customer under the active workspace.
   * credentialsId = null when on the Akina Sandbox.
   */
  async create(userId: string, data: CustomerInput): Promise<void> {
    const credentialsId = await getActiveCredentialsIdForUser(userId);

    await db.insert(customers).values({
      credentialsId,
      userId,
      identification: data.identification,
      dv: data.dv ?? null,
      identificationDocumentId: data.identificationDocumentId,
      legalOrganizationId: data.legalOrganizationId,
      tributeId: data.tributeId,
      name: data.name,
      tradeName: data.tradeName ?? null,
      address: data.address ?? null,
      email: data.email ?? null,
      phone: data.phone ?? null,
      municipalityId: data.municipalityId ?? null,
    });
  },

  /**
   * Returns the full detail of a single customer.
   * Scoped to userId + active credentialsId — throws 404 if not found or not owned.
   */
  async get(userId: string, id: string): Promise<CustomerDetailResult> {
    const credentialsId = await getActiveCredentialsIdForUser(userId);

    const row = await db.query.customers.findFirst({
      where: buildFilter(userId, credentialsId, id),
    });

    if (!row) {
      throw new NotFoundError("Cliente no encontrado");
    }

    return {
      id: row.id,
      identification: row.identification,
      dv: row.dv,
      identificationDocumentId: row.identificationDocumentId,
      legalOrganizationId: row.legalOrganizationId,
      tributeId: row.tributeId,
      name: row.name,
      tradeName: row.tradeName,
      address: row.address,
      email: row.email,
      phone: row.phone,
      municipalityId: row.municipalityId,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  },

  /**
   * Updates an existing customer.
   * Scoped to userId + active credentialsId — throws 404 if not found or not owned.
   */
  async update(userId: string, id: string, data: CustomerInput): Promise<void> {
    const credentialsId = await getActiveCredentialsIdForUser(userId);
    const filter = buildFilter(userId, credentialsId, id);

    const row = await db.query.customers.findFirst({
      where: filter,
      columns: { id: true },
    });

    if (!row) {
      throw new NotFoundError("Cliente no encontrado");
    }

    await db
      .update(customers)
      .set({
        identification: data.identification,
        dv: data.dv ?? null,
        identificationDocumentId: data.identificationDocumentId,
        legalOrganizationId: data.legalOrganizationId,
        tributeId: data.tributeId,
        name: data.name,
        tradeName: data.tradeName ?? null,
        address: data.address ?? null,
        email: data.email ?? null,
        phone: data.phone ?? null,
        municipalityId: data.municipalityId ?? null,
        updatedAt: new Date(),
      })
      .where(filter);
  },

  /**
   * Deletes multiple or a single customer.
   * Scoped to userId + active credentialsId — only deletes rows the user owns.
   * Returns the number of rows actually deleted.
   */
  async delete(userId: string, ids: string[]): Promise<number> {
    if (ids.length === 0) return 0;

    const credentialsId = await getActiveCredentialsIdForUser(userId);
    const baseFilter = buildFilter(userId, credentialsId);

    const result = await db
      .delete(customers)
      .where(and(baseFilter, inArray(customers.id, ids)));

    return result.rowCount ?? 0;
  },
};
