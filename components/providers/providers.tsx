"use client";

import { AppProgressProvider } from "@bprogress/next";

import type { FC, ReactNode } from "react";
import AuthSyncListener from "./auth-sync-listener";
import QueryClientProvider from "./query-client-provider";

interface ProvidersProps {
  children: ReactNode;
}

const Providers: FC<ProvidersProps> = ({ children }) => {
  return (
    <QueryClientProvider>
      <AppProgressProvider
        color="var(--primary)"
        height="4px"
        options={{ showSpinner: false }}
        shallowRouting
      >
        {children}
        <AuthSyncListener />
      </AppProgressProvider>
    </QueryClientProvider>
  );
};

export default Providers;
