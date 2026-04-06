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
import { getApiErrorMessage } from "@/lib/elysia/get-api-error-message";
import { ProductListItem } from "@/lib/elysia/modules/products/service";
import { PRODUCTS_QUERY_KEY } from "@/lib/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FC } from "react";

interface DeleteProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: ProductListItem[];
}

const DeleteProductDialog: FC<DeleteProductDialogProps> = ({
  open,
  onOpenChange,
  products,
}) => {
  const queryClient = useQueryClient();
  const count = products.length;
  const isSingle = count === 1;

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const ids = products.map((p) => p.id);
      const res = await api.products.delete({ ids });
      if (res.error) {
        throw new Error(
          getApiErrorMessage(res.error, "Error al eliminar los productos"),
        );
      }
      return res.data;
    },
    onSuccess: () => {
      toast.success(
        isSingle
          ? "Producto eliminado exitosamente"
          : `${count} productos eliminados exitosamente`,
      );
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const productName = isSingle ? products[0]?.name : undefined;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isSingle
              ? `Eliminar producto ${productName}`
              : `Eliminar ${count} productos`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isSingle
              ? `¿Estás seguro de querer eliminar el producto seleccionado? Esta acción no se puede deshacer.`
              : `¿Estás seguro de querer eliminar ${count} productos? Esta acción no se puede deshacer.`}
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

export default DeleteProductDialog;
