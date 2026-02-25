"use client";

import { AppProgressProvider } from "@bprogress/next";
import type { FC, ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

const Providers: FC<ProvidersProps> = ({ children }) => {
  return (
    <AppProgressProvider
      color="var(--primary)"
      height="4px"
      options={{ showSpinner: false }}
      shallowRouting
    >
      {children}
    </AppProgressProvider>
  );
};

export default Providers;
