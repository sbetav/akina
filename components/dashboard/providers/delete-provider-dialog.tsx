"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { FC } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { api } from "@/elysia/eden";
import { getApiErrorMessage } from "@/elysia/get-api-error-message";
import type { ProviderDetailResult } from "@/elysia/modules/providers";
import { PROVIDERS_QUERY_KEY } from "@/lib/query-keys";

interface DeleteProviderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  providers: ProviderDetailResult[];
}

const DeleteProviderDialog: FC<DeleteProviderDialogProps> = ({
  open,
  onOpenChange,
  providers,
}) => {
  const queryClient = useQueryClient();
  const count = providers.length;
  const isSingle = count === 1;

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const ids = providers.map((p) => p.id);
      const res = await api.providers.delete({ ids });
      if (res.error) {
        throw new Error(
          getApiErrorMessage(res.error, "Error al eliminar los proveedores"),
        );
      }
      return res.data;
    },
    onSuccess: () => {
      toast.success(
        isSingle
          ? "Proveedor eliminado exitosamente"
          : `${count} proveedores eliminados exitosamente`,
      );
      queryClient.invalidateQueries({ queryKey: PROVIDERS_QUERY_KEY });
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const providerName = isSingle ? providers[0]?.names : undefined;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isSingle
              ? `Eliminar proveedor ${providerName}`
              : `Eliminar ${count} proveedores`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isSingle
              ? `¿Estás seguro de querer eliminar el proveedor seleccionado? Esta acción no se puede deshacer.`
              : `¿Estás seguro de querer eliminar ${count} proveedores? Esta acción no se puede deshacer.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => mutate()}
            disabled={isPending}
          >
            {isPending && <Spinner />}
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteProviderDialog;
