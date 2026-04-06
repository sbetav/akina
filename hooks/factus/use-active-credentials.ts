"use client";

import { useActiveCredentialsContext } from "@/contexts/active-credentials-context";
import { AKINA_SANDBOX_ID } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import { credentialsListQueryOptions } from "./credentials-query-options";

export function useActiveCredentials() {
  const {
    activate,
    isActivating,
    uiSelectedCredentialId,
    setUiSelectedCredentialId,
  } = useActiveCredentialsContext();

  const { data, isLoading } = useQuery(credentialsListQueryOptions);

  const credentials = data?.items ?? [];
  const active = credentials.find((c) => c.isActive);
  const isAkinaSandbox = active?.id === AKINA_SANDBOX_ID;

  return {
    credentials,
    active,
    isLoading,
    activate,
    isActivating,
    isAkinaSandbox,
    uiSelectedCredentialId,
    setUiSelectedCredentialId,
  };
}
