"use client";

import { getQueryClient } from "@/lib/query-client";
import { QueryClientProvider as TanstackQueryClientProvider } from "@tanstack/react-query";

export default function QueryClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();

  return (
    <TanstackQueryClientProvider client={queryClient}>
      {children}
    </TanstackQueryClientProvider>
  );
}
