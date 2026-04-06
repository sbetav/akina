"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useActiveCredentials } from "@/hooks/factus/use-active-credentials";
import { api } from "@/lib/elysia/eden";
import { NUMBERING_RANGES_QUERY_KEY } from "@/lib/query-keys";
import {
  NumberingRangeFormValues,
  numberingRangeSchema,
  requiresResolution,
} from "@/lib/validations/numbering-ranges";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useIsFetching,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { NumberingRangeDocumentTypeCode } from "factus-js";
import { PlusIcon, SaveIcon } from "lucide-react";
import { FC, useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

const DOCUMENT_OPTIONS = Object.values(NumberingRangeDocumentTypeCode);

const CreateNumberingRangeDialog: FC = () => {
  const { isAkinaSandbox } = useActiveCredentials();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const isFetchingRanges = useIsFetching({
    queryKey: NUMBERING_RANGES_QUERY_KEY,
    predicate: (query) => query.state.data === undefined,
  });

  const { control, handleSubmit, reset, setValue, trigger } =
    useForm<NumberingRangeFormValues>({
      resolver: zodResolver(numberingRangeSchema),
      defaultValues: {
        document: DOCUMENT_OPTIONS[0].value,
        prefix: "",
        current: 1,
        resolutionNumber: "",
      },
    });

  const document = useWatch({ control, name: "document" });
  const showResolution = requiresResolution(document);

  useEffect(() => {
    if (!showResolution) {
      setValue("resolutionNumber", undefined);
      trigger("resolutionNumber");
    }
  }, [showResolution, setValue, trigger]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: NumberingRangeFormValues) => {
      const res = await api.factus["numbering-ranges"].post({
        document: values.document,
        prefix: values.prefix.trim(),
        current: values.current,
        resolutionNumber: values.resolutionNumber?.trim() || undefined,
      });

      if (res.error) {
        throw new Error(
          (res.error as { value?: { error?: string } }).value?.error ??
            "Error al crear el rango",
        );
      }

      return res.data;
    },
    onSuccess: () => {
      toast.success("Rango creado exitosamente");
      queryClient.invalidateQueries({ queryKey: NUMBERING_RANGES_QUERY_KEY });
      setOpen(false);
      reset();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isAkinaSandbox) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      disablePointerDismissal={isPending}
    >
      <DialogTrigger
        render={
          <Button disabled={!!isFetchingRanges}>
            <PlusIcon />
            Crear rango
          </Button>
        }
      />

      <DialogContent className="sm:max-w-lg" showCloseButton={!isPending}>
        <DialogHeader>
          <DialogTitle>Crear rango de numeración</DialogTitle>
          <DialogDescription>
            Configura un nuevo rango para tu cuenta de Factus.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit((values) => mutate(values))}>
          <FieldGroup>
            <Controller
              control={control}
              name="document"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Documento</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id={field.name}
                      className="w-full"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue>
                        {(value: string) => {
                          const match = DOCUMENT_OPTIONS.find(
                            (d) => String(d.value) === value,
                          );
                          return (
                            (match?.description ?? value) ||
                            "Selecciona una opción"
                          );
                        }}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Controller
                control={control}
                name="prefix"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Prefijo</FieldLabel>
                    <Input
                      id={field.name}
                      placeholder="SETP"
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="current"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>
                      Consecutivo actual
                    </FieldLabel>
                    <NumberInput
                      id={field.name}
                      min={1}
                      placeholder="1"
                      aria-invalid={fieldState.invalid}
                      value={field.value}
                      onValueChange={(value) => field.onChange(value ?? 1)}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>

            {showResolution && (
              <Controller
                control={control}
                name="resolutionNumber"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>
                      Número de resolución
                    </FieldLabel>
                    <Input
                      id={field.name}
                      placeholder="18760000001"
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            )}
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Spinner /> : <SaveIcon />}
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNumberingRangeDialog;
