"use client";

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
import { api } from "@/lib/elysia/eden";
import { CredentialListItem } from "@/lib/elysia/modules/factus";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { FC } from "react";

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
      await api.factus
        .credentials({
          id: credential?.id,
        })
        .delete();
    },
    onSuccess: () => {
      toast.success("Credencial eliminada exitosamente");
      queryClient.invalidateQueries({ queryKey: ["factus", "credentials"] });
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
