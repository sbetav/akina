import { useRouter } from "@bprogress/next/app";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { authClient } from "../lib/auth-client";

export const useLogout = () => {
  const router = useRouter();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async () => {
      await authClient.signOut();
      router.replace("/login");
    },
  });
  const logout = async () => {
    toast.promise(mutateAsync(), {
      loading: "Cerrando sesión...",
      success: "Sesión finalizada exitosamente",
      error: "Error al cerrar sesión",
    });
  };
  return { logout, isPending };
};
