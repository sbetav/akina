import { toast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth/client";
import { publishCrossTabSyncEvent } from "@/lib/cross-tab-sync";
import { useRouter } from "@bprogress/next/app";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async () => {
      await queryClient.cancelQueries();
      queryClient.clear();
      await authClient.signOut();

      publishCrossTabSyncEvent({ type: "logout", at: Date.now() });
      router.replace("/login");
    },
  });
  const logout = async () => {
    toast.promise(mutateAsync(), {
      loading: "Cerrando sesión",
      success: "Sesión finalizada",
      error: "Error al cerrar sesión",
    });
  };
  return { logout, isPending };
};
