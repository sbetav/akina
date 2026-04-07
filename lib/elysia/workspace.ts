import { and, eq, isNull, type SQL } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import { db } from "@/db/drizzle";
import { factusCredentials } from "@/db/schemas/factus-credentials";

/**
 * Resolves the active credentials_id for the given user.
 *
 * Returns `null` when the user is on the Akina Sandbox (no active credential).
 * Any entity scoped to a credential workspace (customers, products, invoices…)
 * should use this and treat `null` as "sandbox workspace for this user".
 *
 * Ownership is always enforced via `userId`, so sandbox rows are still
 * user-private even without a credentials FK.
 */
export async function getActiveCredentialsIdForUser(
  userId: string,
): Promise<string | null> {
  const row = await db.query.factusCredentials.findFirst({
    where: and(
      eq(factusCredentials.userId, userId),
      eq(factusCredentials.isActive, true),
    ),
    columns: { id: true },
  });

  return row?.id ?? null;
}

/**
 * Minimal shape any workspace-scoped table must expose.
 * Every entity linked to a credential (customers, products, invoices, …)
 * should have these three columns.
 */
interface WorkspaceScopedTable {
  id: PgColumn;
  userId: PgColumn;
  credentialsId: PgColumn;
}

/**
 * Returns a workspace filter builder bound to a specific table.
 *
 * The returned function pins every query to BOTH the user AND their active
 * credential workspace, preventing cross-user data leaks even when two
 * accounts share the same credential set.
 *
 * `credentialsId = null` means the user is on the Akina Sandbox — the filter
 * uses IS NULL instead of = to match those rows correctly.
 *
 * @example
 * // Once per service module, at the top level:
 * const buildFilter = createWorkspaceFilter(customers);
 *
 * // Inside each method:
 * const credentialsId = await getActiveCredentialsIdForUser(userId);
 * const filter = buildFilter(userId, credentialsId);          // list
 * const filter = buildFilter(userId, credentialsId, rowId);   // get/update/delete
 */
export function createWorkspaceFilter<T extends WorkspaceScopedTable>(
  table: T,
) {
  return (
    userId: string,
    credentialsId: string | null,
    rowId?: string,
  ): SQL => {
    const credFilter =
      credentialsId === null
        ? isNull(table.credentialsId)
        : eq(table.credentialsId, credentialsId);

    const where = rowId
      ? and(eq(table.id, rowId), eq(table.userId, userId), credFilter)
      : and(eq(table.userId, userId), credFilter);

    if (where === undefined) {
      throw new Error("workspace filter: expected combined conditions");
    }

    return where;
  };
}
