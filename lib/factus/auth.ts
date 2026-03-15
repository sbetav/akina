import { db } from "@/db/drizzle";
import { factusToken } from "@/db/schemas/factus-token";
import { env } from "@/lib/env";
import { eq } from "drizzle-orm";

const SAFE_MARGIN_MS = 5 * 60 * 1000;

interface TokenResponse {
  token_type: string;
  expires_in: number;
  access_token: string;
  refresh_token: string;
}

async function fetchToken(
  params: Record<string, string>,
): Promise<TokenResponse> {
  const body = new URLSearchParams(params);

  const res = await fetch(`${env.FACTUS_API_URL}/oauth/token`, {
    method: "POST",
    headers: { Accept: "application/json" },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Factus auth failed (${res.status}): ${text}`);
  }

  return res.json() as Promise<TokenResponse>;
}

async function saveToken(data: TokenResponse): Promise<void> {
  const expiresAt = new Date(Date.now() + data.expires_in * 1000);

  await db
    .insert(factusToken)
    .values({
      id: "singleton",
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt,
    })
    .onConflictDoUpdate({
      target: factusToken.id,
      set: {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt,
        updatedAt: new Date(),
      },
    });
}

export async function authenticate(): Promise<string> {
  const data = await fetchToken({
    grant_type: "password",
    client_id: env.FACTUS_CLIENT_ID,
    client_secret: env.FACTUS_CLIENT_SECRET,
    username: env.FACTUS_USERNAME,
    password: env.FACTUS_PASSWORD,
  });

  await saveToken(data);
  return data.access_token;
}

export async function refreshAccessToken(
  refreshToken: string,
): Promise<string> {
  const data = await fetchToken({
    grant_type: "refresh_token",
    client_id: env.FACTUS_CLIENT_ID,
    client_secret: env.FACTUS_CLIENT_SECRET,
    refresh_token: refreshToken,
  });

  await saveToken(data);
  return data.access_token;
}

export async function getValidToken(): Promise<string> {
  const [stored] = await db
    .select()
    .from(factusToken)
    .where(eq(factusToken.id, "singleton"))
    .limit(1);

  if (!stored) {
    return authenticate();
  }

  const timeUntilExpiry = stored.expiresAt.getTime() - Date.now();

  if (timeUntilExpiry > SAFE_MARGIN_MS) {
    return stored.accessToken;
  }

  try {
    return await refreshAccessToken(stored.refreshToken);
  } catch {
    return authenticate();
  }
}
