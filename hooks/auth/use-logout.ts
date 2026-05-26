import { useRouter } from "@bprogress/next/app";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth/client";
import { publishCrossTabSyncEvent } from "@/lib/cross-tab-sync";

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isRedirecting, setIsRedirecting] = useState(false);
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async () => {
      setIsRedirecting(true);
      await queryClient.cancelQueries();
      queryClient.clear();
      await authClient.signOut();

      publishCrossTabSyncEvent({ type: "logout", at: Date.now() });
    },
    onSuccess: () => {
      router.replace("/login");
    },
    onError: () => {
      setIsRedirecting(false);
    },
  });
  const logout = async () => {
    toast.promise(mutateAsync(), {
      loading: "Cerrando sesión",
      success: "Sesión finalizada",
      error: "Error al cerrar sesión",
    });
  };
  return { logout, isPending, isRedirecting };
};
