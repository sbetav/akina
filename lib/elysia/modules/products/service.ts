import { and, count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import type { ProductStandardId } from "factus-js";
import { db } from "@/db/drizzle";
import { products } from "@/db/schemas/products";
import type { ProductType } from "@/lib/constants";
import { NotFoundError, UnprocessableEntityError } from "@/lib/elysia/errors";
import {
  createWorkspaceFilter,
  getActiveCredentialsIdForUser,
} from "@/lib/elysia/workspace";
import { formatRef } from "@/lib/utils";

// ─── Shared types ─────────────────────────────────────────────────────────────

export interface ProductInput {
  code: string;
  name: string;
  description?: string;
  price: number;
  unitMeasureId: string;
  standardCodeId: ProductStandardId;
  tributeId: string;
  taxRate: number;
  isExcluded: boolean;
  type: ProductType;
}

export interface ProductListItem {
  id: string;
  code: string;
  name: string;
  /** Stored as numeric string from the DB */
  price: number;
  unitMeasureId: string;
  tributeId: string;
  taxRate: number;
  isExcluded: boolean;
  type: ProductType;
  createdAt: string;
}

export interface ProductDetailResult {
  id: string;
  code: string;
  name: string;
  description: string | null;
  price: number;
  unitMeasureId: string;
  standardCodeId: ProductStandardId;
  tributeId: string;
  taxRate: number;
  isExcluded: boolean;
  type: ProductType;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListResult {
  items: ProductListItem[];
  total: number;
  page: number;
  limit: number;
}

// ─── Workspace filter ─────────────────────────────────────────────────────────

const buildFilter = createWorkspaceFilter(products);

// ─── Service ─────────────────────────────────────────────────────────────────

export const ProductService = {
  /**
   * Returns a paginated + searchable list of products scoped to the active
   * workspace (userId + credentialsId). NULL credentialsId = Akina Sandbox.
   * Search matches against name OR code (case-insensitive).
   */
  async list(
    userId: string,
    options: { search?: string; page?: number; limit?: number },
  ): Promise<ProductListResult> {
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
              ilike(products.name, `%${options.search.trim()}%`),
              ilike(products.code, `%${options.search.trim()}%`),
            ),
          )
        : baseFilter;

    const [rows, [{ value: total }]] = await Promise.all([
      db
        .select({
          id: products.id,
          code: products.code,
          name: products.name,
          price: products.price,
          unitMeasureId: products.unitMeasureId,
          tributeId: products.tributeId,
          taxRate: products.taxRate,
          isExcluded: products.isExcluded,
          type: products.type,
          createdAt: products.createdAt,
        })
        .from(products)
        .where(whereClause)
        .orderBy(desc(products.createdAt))
        .limit(limit)
        .offset(offset),

      db.select({ value: count() }).from(products).where(whereClause),
    ]);

    return {
      items: rows.map((r) => ({
        ...r,
        price: Number(r.price ?? 0),
        taxRate: Number(r.taxRate ?? 0),
        type: r.type,
        createdAt: r.createdAt.toISOString(),
      })),
      total: Number(total),
      page,
      limit,
    };
  },

  /**
   * Creates a new product under the active workspace.
   * The provided code must be unique within the workspace; if a duplicate
   * code is detected a descriptive error is thrown.
   * When no explicit code is passed, callers can pre-generate one via
   * `ProductService.nextCode(userId)`.
   */
  async create(userId: string, data: ProductInput): Promise<void> {
    const credentialsId = await getActiveCredentialsIdForUser(userId);

    const available = await ProductService.isCodeAvailable(userId, data.code);
    if (!available) {
      throw new UnprocessableEntityError(
        `El código "${data.code}" ya existe en este espacio de trabajo`,
      );
    }

    await db.insert(products).values({
      credentialsId,
      userId,
      code: data.code,
      name: data.name,
      description: data.description ?? null,
      price: data.price.toString(),
      unitMeasureId: data.unitMeasureId,
      standardCodeId: data.standardCodeId,
      tributeId: data.tributeId,
      taxRate: data.taxRate.toString(),
      isExcluded: data.isExcluded,
      type: data.type,
    });
  },

  /**
   * Returns the full detail of a single product.
   * Scoped to userId + active credentialsId — throws 404 if not found or not owned.
   */
  async get(userId: string, id: string): Promise<ProductDetailResult> {
    const credentialsId = await getActiveCredentialsIdForUser(userId);

    const row = await db.query.products.findFirst({
      where: buildFilter(userId, credentialsId, id),
    });

    if (!row) {
      throw new NotFoundError("Producto no encontrado");
    }

    return {
      id: row.id,
      code: row.code,
      name: row.name,
      description: row.description,
      price: Number(row.price ?? 0),
      unitMeasureId: row.unitMeasureId,
      standardCodeId: row.standardCodeId,
      tributeId: row.tributeId,
      taxRate: Number(row.taxRate ?? 0),
      isExcluded: row.isExcluded,
      type: row.type as ProductType,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  },

  /**
   * Updates an existing product.
   * Scoped to userId + active credentialsId — throws 404 if not found or not owned.
   * Throws on duplicate code collision with another product in the workspace.
   */
  async update(userId: string, id: string, data: ProductInput): Promise<void> {
    const credentialsId = await getActiveCredentialsIdForUser(userId);
    const filter = buildFilter(userId, credentialsId, id);

    const row = await db.query.products.findFirst({
      where: filter,
      columns: { id: true },
    });

    if (!row) {
      throw new NotFoundError("Producto no encontrado");
    }

    await db
      .update(products)
      .set({
        name: data.name,
        description: data.description ?? null,
        price: data.price.toString(),
        unitMeasureId: data.unitMeasureId,
        standardCodeId: data.standardCodeId,
        tributeId: data.tributeId,
        taxRate: data.taxRate.toString(),
        isExcluded: data.isExcluded,
        type: data.type,
        updatedAt: new Date(),
      })
      .where(filter);
  },

  /**
   * Deletes multiple or a single product.
   * Scoped to userId + active credentialsId — only deletes rows the user owns.
   * Returns the number of rows actually deleted.
   */
  async delete(userId: string, ids: string[]): Promise<number> {
    if (ids.length === 0) return 0;

    const credentialsId = await getActiveCredentialsIdForUser(userId);
    const baseFilter = buildFilter(userId, credentialsId);

    const result = await db
      .delete(products)
      .where(and(baseFilter, inArray(products.id, ids)));

    return result.rowCount ?? 0;
  },

  /**
   * Returns the next auto-generated product code for the active workspace.
   * Uses the total count of existing products as the sequence seed so new
   * codes are always > existing ones (not guaranteed unique on concurrent
   * inserts — the unique constraint is the true guard).
   *
   * Exposed separately so the UI can pre-fill the code field before submission.
   */
  async nextCode(userId: string): Promise<string> {
    const credentialsId = await getActiveCredentialsIdForUser(userId);
    const baseFilter = buildFilter(userId, credentialsId);

    const [{ value: total }] = await db
      .select({ value: count() })
      .from(products)
      .where(baseFilter);

    return formatRef("P", Number(total) + 1);
  },

  /**
   * Checks whether a product code is available in the active workspace.
   * Availability is scoped by userId + active credentialsId.
   */
  async isCodeAvailable(userId: string, code: string): Promise<boolean> {
    const credentialsId = await getActiveCredentialsIdForUser(userId);
    const baseFilter = buildFilter(userId, credentialsId);
    const normalizedCode = code.trim();

    const existing = await db.query.products.findFirst({
      where: and(baseFilter, eq(products.code, normalizedCode)),
      columns: { id: true },
    });

    return !existing;
  },
};
