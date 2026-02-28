"use client";

import { AppProgressProvider } from "@bprogress/next";

import type { FC, ReactNode } from "react";
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
      </AppProgressProvider>
    </QueryClientProvider>
  );
};

export default Providers;
