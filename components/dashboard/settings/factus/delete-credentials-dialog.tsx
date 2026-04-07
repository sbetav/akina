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
import type { CredentialListItem } from "@/elysia/modules/factus/service";
import { CREDENTIALS_QUERY_KEY } from "@/lib/query-keys";

interface DeleteCredentialsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  credential?: CredentialListItem;
}

const DeleteCredentialsDialog: FC<DeleteCredentialsDialogProps> = ({
  open,
  onOpenChange,
  credential,
}) => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!credential?.id) throw new Error("Credencial no encontrada");
      const res = await api.factus
        .credentials({
          id: credential.id,
        })
        .delete();
      if (res.error) {
        throw new Error(
          getApiErrorMessage(res.error, "Error al eliminar la credencial"),
        );
      }
    },
    onSuccess: () => {
      toast.success("Credencial eliminada exitosamente");
      queryClient.invalidateQueries({ queryKey: CREDENTIALS_QUERY_KEY });
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Eliminar credencial {credential?.name}
          </AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de querer eliminar la credencial {credential?.name}?
            Esta acción no se puede deshacer.
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

export default DeleteCredentialsDialog;
