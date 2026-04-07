"use client";

import { subscribeCrossTabSyncEvents } from "@/lib/cross-tab-sync";
import { useRouter } from "@bprogress/next";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export default function AuthSyncListener() {
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    return subscribeCrossTabSyncEvents((event) => {
      if (event.type === "logout") {
        void queryClient.cancelQueries();
        queryClient.clear();
        router.replace("/login");
      } else if (event.type === "login") {
        router.replace("/dashboard");
      }
    });
  }, [queryClient, router]);

  return null;
}
