import { toast } from "@/components/ui/toast";
import { useRouter } from "@bprogress/next/app";
import { useMutation } from "@tanstack/react-query";
import { authClient } from "../lib/auth/client";

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
      loading: "Cerrando sesión",
      success: "Sesión finalizada",
      error: "Error al cerrar sesión",
    });
  };
  return { logout, isPending };
};
