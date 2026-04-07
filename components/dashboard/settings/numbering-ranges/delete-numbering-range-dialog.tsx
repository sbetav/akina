"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2Icon } from "lucide-react";
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
import { api } from "@/lib/elysia/eden";
import { getApiErrorMessage } from "@/lib/elysia/get-api-error-message";
import type { NumberingRangeItemResult } from "@/lib/elysia/modules/factus/service";
import { NUMBERING_RANGES_QUERY_KEY } from "@/lib/query-keys";

interface DeleteNumberingRangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  range: NumberingRangeItemResult | null;
}

const DeleteNumberingRangeDialog: FC<DeleteNumberingRangeDialogProps> = ({
  open,
  onOpenChange,
  range,
}) => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!range) return;
      const res = await api.factus["numbering-ranges"]({
        id: range.id,
      }).delete();
      if (res.error) {
        throw new Error(
          getApiErrorMessage(res.error, "Error al eliminar el rango"),
        );
      }
    },
    onSuccess: () => {
      toast.success("Rango eliminado exitosamente");
      queryClient.invalidateQueries({ queryKey: NUMBERING_RANGES_QUERY_KEY });
      onOpenChange(false);
    },
    onError: (e: Error) => {
      toast.error(e.message);
      onOpenChange(false);
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Eliminar rango con prefijo {range?.prefix}
          </AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de querer eliminar este rango? Esta acción no se puede
            deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            variant="outline"
            size="default"
            disabled={isPending}
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => mutate()}
            disabled={isPending}
          >
            {isPending ? <Spinner /> : <Trash2Icon />}
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteNumberingRangeDialog;
