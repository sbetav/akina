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
import type { CustomerListItem } from "@/elysia/modules/customers";
import { CUSTOMERS_QUERY_KEY } from "@/lib/query-keys";

interface DeleteCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customers: CustomerListItem[];
}

const DeleteCustomerDialog: FC<DeleteCustomerDialogProps> = ({
  open,
  onOpenChange,
  customers,
}) => {
  const queryClient = useQueryClient();
  const count = customers.length;
  const isSingle = count === 1;

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const ids = customers.map((c) => c.id);
      const res = await api.customers.delete({ ids });
      if (res.error) {
        throw new Error(
          getApiErrorMessage(res.error, "Error al eliminar los clientes"),
        );
      }
      return res.data;
    },
    onSuccess: () => {
      toast.success(
        isSingle
          ? "Cliente eliminado exitosamente"
          : `${count} clientes eliminados exitosamente`,
      );
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY });
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const customerName = isSingle ? customers[0]?.name : undefined;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isSingle
              ? `Eliminar cliente ${customerName}`
              : `Eliminar ${count} clientes`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isSingle
              ? `¿Estás seguro de querer eliminar el cliente seleccionado? Esta acción no se puede deshacer.`
              : `¿Estás seguro de querer eliminar ${count} clientes? Esta acción no se puede deshacer.`}
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

export default DeleteCustomerDialog;
