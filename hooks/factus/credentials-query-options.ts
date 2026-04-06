import { api } from "@/lib/elysia/eden";
import { CREDENTIALS_QUERY_KEY } from "@/lib/query-keys";

export async function fetchCredentialsList() {
  const res = await api.factus.credentials.get();
  if (res.error)
    throw new Error(
      (res.error as { value?: { error?: string } }).value?.error ??
        "Error al obtener las credenciales",
    );
  return res.data;
}

export const credentialsListQueryOptions = {
  queryKey: CREDENTIALS_QUERY_KEY,
  queryFn: fetchCredentialsList,
} as const;
