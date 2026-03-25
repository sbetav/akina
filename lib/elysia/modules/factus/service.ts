import { db } from "@/db/drizzle";
import { factusCredentials } from "@/db/schemas/factus-credentials";
import { decrypt, encrypt } from "@/lib/crypto";
import { getFactusClientForUser } from "@/lib/factus";
import { and, asc, eq } from "drizzle-orm";
import { FactusClient, FactusError, IdentityDocumentTypeId } from "factus-js";

// ─── Shared types ─────────────────────────────────────────────────────────────

export type FactusEnvironment = "sandbox" | "production";

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
  description: string;
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

export interface GetConnectionResult {
  isValid: boolean;
  environment: FactusEnvironment;
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

// ─── Service ─────────────────────────────────────────────────────────────────

export class FactusService {
  /**
   * Get the connection status with Factus.
   */
  static async getConnection(userId: string): Promise<GetConnectionResult> {
    const active = await db.query.factusCredentials.findFirst({
      where: and(
        eq(factusCredentials.userId, userId),
        eq(factusCredentials.isActive, true),
      ),
    });

    if (!active) {
      // Akina Sandbox — always valid
      return { isValid: true, environment: "sandbox" };
    }

    try {
      const client = new FactusClient({
        clientId: active.clientId,
        clientSecret: decrypt(active.clientSecret),
        username: active.username,
        password: decrypt(active.password),
        environment: active.environment as FactusEnvironment,
      });

      const isValid = await validateClient(client);
      return {
        isValid,
        environment: active.environment as FactusEnvironment,
      };
    } catch {
      // Corrupted encrypted data or validation failure — treat as invalid
      return {
        isValid: false,
        environment: active.environment as FactusEnvironment,
      };
    }
  }

  /**
   * List all credential sets for a user, each with a live validity check
   * (run in parallel). Invalid credentials are sorted to the end.
   */
  static async listCredentials(userId: string): Promise<CredentialListItem[]> {
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
            environment: row.environment as FactusEnvironment,
          });
          const isValid = await validateClient(client);
          return {
            id: row.id,
            name: row.name,
            description: `${row.username} - ${row.clientId}`,
            environment: row.environment as FactusEnvironment,
            isActive: row.isActive,
            isValid,
          } satisfies CredentialListItem;
        } catch {
          // Corrupted encrypted data — mark as invalid rather than crashing
          return {
            id: row.id,
            name: row.name,
            description: `${row.username} - ${row.clientId}`,
            environment: row.environment as FactusEnvironment,
            isActive: row.isActive,
            isValid: false,
          } satisfies CredentialListItem;
        }
      }),
    );

    // Sort: valid items first (preserving insertion order within each group),
    // invalid items last. Include Akina Sandbox only when user has own credentials.
    const sandbox: CredentialListItem | null =
      validated.length > 0
        ? {
            id: "akina-sandbox",
            name: "Akina Sandbox",
            description: "Ideal para hacer pruebas y explorar la plataforma. ",
            environment: "sandbox",
            isActive: !validated.some((v) => v.isActive),
            isValid: true,
          }
        : null;

    return sandbox ? [sandbox, ...validated] : validated;
  }

  /**
   * Get a single credential set with decrypted secrets (for edit prefill).
   * Includes a live validity check. Throws if the credential doesn't belong to the user.
   */
  static async getCredential(
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
      throw new Error("Credencial no encontrada");
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
        environment: row.environment as FactusEnvironment,
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
      environment: row.environment as FactusEnvironment,
      isActive: row.isActive,
      isValid,
    };
  }

  /**
   * Validate + create a new credential set.
   * If this is the user's first credential, it is automatically set as active.
   * Throws if credentials are invalid.
   */
  static async createCredential(input: CredentialInput): Promise<void> {
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
      throw new Error("Ya existe una credencial con los mismos datos.");
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
      throw new Error("Las credenciales no son válidas. Verifica tus datos.");
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
  }

  /**
   * Validate + update an existing credential set.
   * Throws if the credential doesn't belong to the user or if credentials are invalid.
   */
  static async updateCredential(
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
      throw new Error("Credencial no encontrada");
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
      throw new Error("Las credenciales no son válidas. Verifica tus datos.");
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
  }

  /**
   * Delete a credential set. If it was the active one, no automatic fallback
   * is set — the user will fall back to Akina Sandbox on next use.
   * Throws if the credential doesn't belong to the user.
   */
  static async deleteCredential(userId: string, id: string): Promise<void> {
    const row = await db.query.factusCredentials.findFirst({
      where: and(
        eq(factusCredentials.id, id),
        eq(factusCredentials.userId, userId),
      ),
    });

    if (!row) {
      throw new Error("Credencial no encontrada");
    }

    await db
      .delete(factusCredentials)
      .where(
        and(eq(factusCredentials.id, id), eq(factusCredentials.userId, userId)),
      );
  }

  /**
   * Set a credential as active (deactivates all others for the user).
   * Pass id = null to deactivate all (revert to Akina Sandbox).
   */
  static async setActiveCredential(
    userId: string,
    id: string | null,
  ): Promise<void> {
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
        throw new Error("Credencial no encontrada");
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
  }

  /** Get municipalities from the current user's active Factus client. */
  static async getMunicipalities(
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
  }

  /** Get an acquirer by document type + number. */
  static async getAcquirer(
    userId: string,
    identificationDocumentId: string,
    identificationNumber: string,
  ): Promise<{ name: string; email: string }> {
    const client = await getFactusClientForUser(userId);

    const res = await client.catalog.getAcquirer({
      identification_document_id: Number(
        identificationDocumentId,
      ) as IdentityDocumentTypeId,
      identification_number: identificationNumber,
    });
    return { name: res.data.name, email: res.data.email };
  }
}
