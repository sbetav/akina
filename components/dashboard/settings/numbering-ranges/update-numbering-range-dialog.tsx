"use client";

import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { NumberInput } from "@/components/ui/number-input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { api } from "@/lib/elysia/eden";
import { getApiErrorMessage } from "@/lib/elysia/get-api-error-message";
import { NumberingRangeItemResult } from "@/lib/elysia/modules/factus/service";
import { NUMBERING_RANGES_QUERY_KEY } from "@/lib/query-keys";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SaveIcon } from "lucide-react";
import { FC } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

interface UpdateNumberingRangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  range: NumberingRangeItemResult | null;
}

const UpdateNumberingRangeDialog: FC<UpdateNumberingRangeDialogProps> = ({
  range,
  open,
  onOpenChange,
}) => {
  const queryClient = useQueryClient();

  const {
    handleSubmit,
    control,
    reset: resetForm,
  } = useForm<{ current: number }>({
    resolver: zodResolver(
      z.object({
        current: z
          .number({ error: "Campo requerido" })
          .min(1, "El consecutivo debe ser mayor o igual a 1"),
      }),
    ),
    values: {
      current: range?.current ?? 1,
    },
  });

  const {
    mutate,
    isPending,
    reset: resetMutation,
    error,
  } = useMutation({
    mutationFn: async ({ current }: { current: number }) => {
      if (!range) return;
      const res = await api.factus["numbering-ranges"]({
        id: range.id,
      }).current.patch({ current });

      if (res.error) {
        throw new Error(
          getApiErrorMessage(res.error, "Error al actualizar el consecutivo"),
        );
      }

      return res.data;
    },
    onSuccess: () => {
      toast.success("Consecutivo actualizado exitosamente");
      queryClient.invalidateQueries({ queryKey: NUMBERING_RANGES_QUERY_KEY });
      onOpenChange(false);
    },
  });

  const onSubmit = handleSubmit((data) => mutate(data));

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
          setTimeout(() => {
            resetForm();
            resetMutation();
          }, 150);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Actualizar consecutivo</DialogTitle>
          <DialogDescription>
            Ajusta el consecutivo actual para el rango {range?.prefix}.
          </DialogDescription>
        </DialogHeader>

        <form id="update-numbering-range-form" onSubmit={onSubmit}>
          <Controller
            control={control}
            name="current"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Consecutivo actual</FieldLabel>
                <NumberInput
                  id={field.name}
                  placeholder="1"
                  min={1}
                  aria-invalid={fieldState.invalid}
                  value={field.value}
                  onValueChange={(value) => field.onChange(value ?? 1)}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </form>

        {error && (
          <Alert variant="destructive" size="sm">
            <AlertTitle className="text-xs">{error.message}</AlertTitle>
          </Alert>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="update-numbering-range-form"
            disabled={isPending}
          >
            {isPending ? <Spinner /> : <SaveIcon />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateNumberingRangeDialog;
