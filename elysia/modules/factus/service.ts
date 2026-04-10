import { and, asc, eq } from "drizzle-orm";
import {
  FactusClient,
  FactusError,
  type IdentityDocumentTypeId,
  type NumberingRangeDocumentTypeCode,
} from "factus-js";
import { db } from "@/db/drizzle";
import { factusCredentials } from "@/db/schemas/factus-credentials";
import { NotFoundError, UnprocessableEntityError } from "@/elysia/errors";
import { AKINA_SANDBOX_ID, type FactusEnvironment } from "@/lib/constants";
import { decrypt, encrypt } from "@/lib/crypto";
import { getFactusClientForUser } from "@/lib/factus";

// ─── Input types ──────────────────────────────────────────────────────────────

export interface CredentialInput {
  userId: string;
  name: string;
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
  environment: FactusEnvironment;
}

// ─── Response types ───────────────────────────────────────────────────────────

export interface CredentialListItem {
  id: string;
  name: string;
  username: string;
  clientId: string;
  environment: FactusEnvironment;
  isActive: boolean;
  isValid: boolean;
}

export interface CredentialDetailResult {
  id: string;
  name: string;
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
  environment: FactusEnvironment;
  isActive: boolean;
  isValid: boolean;
}

export interface NumberingRangeListQueryInput {
  id?: string;
  document?: NumberingRangeDocumentTypeCode;
  resolutionNumber?: string;
  technicalKey?: string;
  isActive?: "0" | "1";
  page?: number;
  limit?: number;
}

export interface NumberingRangeCreateInput {
  document: NumberingRangeDocumentTypeCode;
  prefix: string;
  current: number;
  resolutionNumber?: string;
}

export interface NumberingRangeItemResult {
  id: number;
  document: string;
  documentName?: string;
  prefix: string;
  from: number | null;
  to: number | null;
  current: number;
  resolutionNumber: string | null;
  startDate: string | null;
  endDate: string | null;
  technicalKey: string | null;
  isExpired: boolean;
  isActive: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NumberingRangeListResult {
  items: NumberingRangeItemResult[];
  total: number;
  page: number;
  limit: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Validate a FactusClient by calling a lightweight catalog endpoint.
 * Returns true if the credentials are accepted, false otherwise.
 */
async function validateClient(client: FactusClient): Promise<boolean> {
  try {
    await client.catalog.listCountries();
    return true;
  } catch (e) {
    if (e instanceof FactusError) return false;
    throw e;
  }
}

function isFactusNotFoundError(error: unknown): boolean {
  if (!(error instanceof FactusError)) return false;

  const candidate = error as FactusError & {
    status?: number;
    statusCode?: number;
    response?: { status?: number };
    cause?: {
      status?: number;
      statusCode?: number;
      response?: { status?: number };
    };
  };

  return (
    candidate.status === 404 ||
    candidate.statusCode === 404 ||
    candidate.response?.status === 404 ||
    candidate.cause?.status === 404 ||
    candidate.cause?.statusCode === 404 ||
    candidate.cause?.response?.status === 404 ||
    candidate.message.toLowerCase().includes("not found")
  );
}

function normalizeNumberingRange(range: {
  id: number;
  document: string;
  document_name?: string;
  prefix: string;
  from: number;
  to: number;
  current: number;
  resolution_number: string | null;
  start_date: string;
  end_date: string;
  technical_key: string | null;
  is_expired: boolean | 0 | 1;
  is_active: boolean | 0 | 1;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}): NumberingRangeItemResult {
  return {
    id: range.id,
    document: range.document,
    documentName: range.document_name,
    prefix: range.prefix,
    from: range.from,
    to: range.to,
    current: range.current,
    resolutionNumber: range.resolution_number,
    startDate: range.start_date,
    endDate: range.end_date,
    technicalKey: range.technical_key,
    isExpired: Boolean(range.is_expired),
    isActive: Boolean(range.is_active),
    deletedAt: range.deleted_at,
    createdAt: range.created_at,
    updatedAt: range.updated_at,
  };
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const FactusService = {
  /**
   * List all credential sets for a user, each with a live validity check
   * (run in parallel). Invalid credentials are sorted to the end.
   */
  async listCredentials(userId: string): Promise<CredentialListItem[]> {
    const rows = await db.query.factusCredentials.findMany({
      where: eq(factusCredentials.userId, userId),
      orderBy: [asc(factusCredentials.createdAt)],
    });

    const validated = await Promise.all(
      rows.map(async (row) => {
        try {
          const client = new FactusClient({
            clientId: row.clientId,
            clientSecret: decrypt(row.clientSecret),
            username: row.username,
            password: decrypt(row.password),
            environment: row.environment,
          });
          const isValid = await validateClient(client);
          return {
            id: row.id,
            name: row.name,
            username: row.username,
            clientId: row.clientId,
            environment: row.environment,
            isActive: row.isActive,
            isValid,
          } satisfies CredentialListItem;
        } catch {
          // Corrupted encrypted data — mark as invalid rather than crashing
          return {
            id: row.id,
            name: row.name,
            username: row.username,
            clientId: row.clientId,
            environment: row.environment,
            isActive: row.isActive,
            isValid: false,
          } satisfies CredentialListItem;
        }
      }),
    );

    // Sort: valid items first (preserving insertion order within each group),
    // invalid items last.
    const sandbox: CredentialListItem = {
      id: AKINA_SANDBOX_ID,
      name: "Akina",
      username: AKINA_SANDBOX_ID,
      clientId: AKINA_SANDBOX_ID,
      environment: "sandbox",
      isActive: !validated.some((v) => v.isActive),
      isValid: true,
    };

    return [sandbox, ...validated];
  },

  /**
   * Get a single credential set with decrypted secrets (for edit prefill).
   * Includes a live validity check. Throws if the credential doesn't belong to the user.
   */
  async getCredential(
    userId: string,
    id: string,
  ): Promise<CredentialDetailResult> {
    const row = await db.query.factusCredentials.findFirst({
      where: and(
        eq(factusCredentials.id, id),
        eq(factusCredentials.userId, userId),
      ),
    });

    if (!row) {
      throw new NotFoundError("Credencial no encontrada");
    }

    let decryptedSecret: string;
    let decryptedPassword: string;
    let isValid: boolean;

    try {
      decryptedSecret = decrypt(row.clientSecret);
      decryptedPassword = decrypt(row.password);

      const client = new FactusClient({
        clientId: row.clientId,
        clientSecret: decryptedSecret,
        username: row.username,
        password: decryptedPassword,
        environment: row.environment,
      });

      isValid = await validateClient(client);
    } catch {
      // Corrupted encrypted data — return what we can, mark as invalid
      decryptedSecret = "";
      decryptedPassword = "";
      isValid = false;
    }

    return {
      id: row.id,
      name: row.name,
      clientId: row.clientId,
      clientSecret: decryptedSecret,
      username: row.username,
      password: decryptedPassword,
      environment: row.environment,
      isActive: row.isActive,
      isValid,
    };
  },

  /**
   * Validate + create a new credential set.
   * If this is the user's first credential, it is automatically set as active.
   * Throws if credentials are invalid.
   */
  async createCredential(input: CredentialInput): Promise<void> {
    const {
      userId,
      name,
      clientId,
      clientSecret,
      username,
      password,
      environment,
    } = input;

    const candidates = await db.query.factusCredentials.findMany({
      where: and(
        eq(factusCredentials.userId, userId),
        eq(factusCredentials.clientId, clientId),
        eq(factusCredentials.username, username),
        eq(factusCredentials.environment, environment),
      ),
    });

    const hasExactDuplicate = candidates.some(
      (row) =>
        decrypt(row.clientSecret) === clientSecret &&
        decrypt(row.password) === password,
    );

    if (hasExactDuplicate) {
      throw new UnprocessableEntityError(
        "Ya existe una credencial con los mismos datos.",
      );
    }

    const testClient = new FactusClient({
      clientId,
      clientSecret,
      username,
      password,
      environment,
    });

    const isValid = await validateClient(testClient);
    if (!isValid) {
      throw new UnprocessableEntityError(
        "Las credenciales no son válidas. Verifica tus datos.",
      );
    }

    await db.insert(factusCredentials).values({
      userId,
      name,
      clientId,
      clientSecret: encrypt(clientSecret),
      username,
      password: encrypt(password),
      environment,
      isActive: false,
    });
  },

  /**
   * Validate + update an existing credential set.
   * Throws if the credential doesn't belong to the user or if credentials are invalid.
   */
  async updateCredential(
    userId: string,
    id: string,
    input: Omit<CredentialInput, "userId">,
  ): Promise<void> {
    const { name, clientId, clientSecret, username, password, environment } =
      input;

    // Ownership check
    const row = await db.query.factusCredentials.findFirst({
      where: and(
        eq(factusCredentials.id, id),
        eq(factusCredentials.userId, userId),
      ),
    });

    if (!row) {
      throw new NotFoundError("Credencial no encontrada");
    }

    const testClient = new FactusClient({
      clientId,
      clientSecret,
      username,
      password,
      environment,
    });

    const isValid = await validateClient(testClient);
    if (!isValid) {
      throw new UnprocessableEntityError(
        "Las credenciales no son válidas. Verifica tus datos.",
      );
    }

    await db
      .update(factusCredentials)
      .set({
        name,
        clientId,
        clientSecret: encrypt(clientSecret),
        username,
        password: encrypt(password),
        environment,
        updatedAt: new Date(),
      })
      .where(
        and(eq(factusCredentials.id, id), eq(factusCredentials.userId, userId)),
      );
  },

  /**
   * Delete a credential set. If it was the active one, no automatic fallback
   * is set — the user will fall back to Akina Sandbox on next use.
   * Throws if the credential doesn't belong to the user.
   */
  async deleteCredential(userId: string, id: string): Promise<void> {
    const row = await db.query.factusCredentials.findFirst({
      where: and(
        eq(factusCredentials.id, id),
        eq(factusCredentials.userId, userId),
      ),
    });

    if (!row) {
      throw new NotFoundError("Credencial no encontrada");
    }

    await db
      .delete(factusCredentials)
      .where(
        and(eq(factusCredentials.id, id), eq(factusCredentials.userId, userId)),
      );
  },

  /**
   * Set a credential as active (deactivates all others for the user).
   * Pass id = null to deactivate all (revert to Akina Sandbox).
   */
  async setActiveCredential(userId: string, id: string | null): Promise<void> {
    // Deactivate all for this user first
    await db
      .update(factusCredentials)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(factusCredentials.userId, userId));

    if (id !== null) {
      const row = await db.query.factusCredentials.findFirst({
        where: and(
          eq(factusCredentials.id, id),
          eq(factusCredentials.userId, userId),
        ),
      });

      if (!row) {
        throw new NotFoundError("Credencial no encontrada");
      }

      await db
        .update(factusCredentials)
        .set({ isActive: true, updatedAt: new Date() })
        .where(
          and(
            eq(factusCredentials.id, id),
            eq(factusCredentials.userId, userId),
          ),
        );
    }
  },

  /** Get municipalities from the current user's active Factus client. */
  async getMunicipalities(
    userId: string,
    name?: string,
  ): Promise<{ id: number; code: string; name: string; department: string }[]> {
    const client = await getFactusClientForUser(userId);

    const res = await client.catalog.listMunicipalities(
      name ? { filter: { name } } : undefined,
    );
    return res.data.map(
      (m: { id: number; code: string; name: string; department: string }) => ({
        id: m.id,
        code: m.code,
        name: m.name,
        department: m.department,
      }),
    );
  },

  /** Get an acquirer by document type + number. */
  async getAcquirer(
    userId: string,
    identificationDocumentId: IdentityDocumentTypeId,
    identificationNumber: string,
  ): Promise<{ name: string; email: string }> {
    const client = await getFactusClientForUser(userId);

    try {
      const res = await client.catalog.getAcquirer({
        identification_document_id: identificationDocumentId,
        identification_number: identificationNumber,
      });

      return { name: res.data.name, email: res.data.email };
    } catch (error) {
      if (isFactusNotFoundError(error)) {
        throw new NotFoundError("Adquiriente no encontrado");
      }

      throw error;
    }
  },

  /** Get measurement units from the current user's active Factus client. */
  async getMeasurementUnits(
    userId: string,
  ): Promise<{ id: number; code: string; name: string }[]> {
    const client = await getFactusClientForUser(userId);
    const res = await client.catalog.listMeasurementUnits();
    return res.data.map((u: { id: number; code: string; name: string }) => ({
      id: u.id,
      code: u.code,
      name: u.name,
    }));
  },

  /** Get product tributes from the current user's active Factus client. */
  async getTributes(
    userId: string,
  ): Promise<
    { id: number; code: string; name: string; description: string }[]
  > {
    const client = await getFactusClientForUser(userId);
    const res = await client.catalog.listTributes();
    return res.data.map((t) => ({
      id: t.id,
      code: t.code,
      name: t.name,
      description: t.description,
    }));
  },

  /** List numbering ranges from the current user's active Factus client. */
  async listNumberingRanges(
    userId: string,
    query: NumberingRangeListQueryInput,
  ): Promise<NumberingRangeListResult> {
    const client = await getFactusClientForUser(userId);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const res = await client.numberingRanges.list({
      filter: {
        id: query.id,
        document: query.document,
        resolution_number: query.resolutionNumber,
        technical_key: query.technicalKey,
        is_active: query.isActive,
      },
      page,
      per_page: limit,
    });

    return {
      items: res.data.data.map(normalizeNumberingRange),
      total: res.data.pagination.total,
      page,
      limit,
    };
  },

  /** Create a numbering range in the current user's active Factus client. */
  async createNumberingRange(
    userId: string,
    input: NumberingRangeCreateInput,
  ): Promise<NumberingRangeItemResult> {
    const client = await getFactusClientForUser(userId);

    const res = await client.numberingRanges.create({
      document: input.document,
      prefix: input.prefix,
      current: input.current,
      resolution_number: input.resolutionNumber,
    });

    return normalizeNumberingRange(res.data);
  },

  /** Delete a numbering range by id in the current user's active Factus client. */
  async deleteNumberingRange(userId: string, id: number): Promise<void> {
    const client = await getFactusClientForUser(userId);
    await client.numberingRanges.delete(id);
  },

  /** Update numbering range current consecutive number by id. */
  async updateNumberingRangeCurrent(
    userId: string,
    id: number,
    current: number,
  ): Promise<NumberingRangeItemResult> {
    const client = await getFactusClientForUser(userId);
    const res = await client.numberingRanges.updateCurrent(id, { current });
    return normalizeNumberingRange(res.data);
  },
};
