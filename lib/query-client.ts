import { QueryClient } from "@tanstack/react-query";
import { cache } from "react";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });
}

/**
 * Returns a per-request QueryClient on the server (deduped via React cache),
 * or the singleton browser client when called from a client component.
 *
 * Import this from server components for SSR prefetching.
 * Client components should use `useQueryClient()` instead.
 */
export const getQueryClient = cache(makeQueryClient);
