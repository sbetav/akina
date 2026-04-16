"use client";

import { AdjustmentNoteReasonCode } from "factus-js";
import { type FC, useEffect } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import {
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/dashboard/page-header";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { COP } from "@/lib/utils";
import type { AdjustmentNoteFormValues } from "@/lib/validations/adjustment-note";

const ItemsFieldset: FC = () => {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<AdjustmentNoteFormValues>();
  const items = useWatch({ control, name: "items" }) ?? [];
  const itemsRootError = errors.items?.root;
  const correctionConceptCode = useWatch({
    control,
    name: "correctionConceptCode",
  });
  const isSupportDocumentCancellation =
    correctionConceptCode ===
    AdjustmentNoteReasonCode.SupportDocumentCancellation;

  useEffect(() => {
    if (!isSupportDocumentCancellation) return;

    items.forEach((item, index) => {
      if (item.quantity === item.maxQuantity) return;

      setValue(`items.${index}.quantity`, item.maxQuantity, {
        shouldDirty: true,
        shouldValidate: true,
      });
    });
  }, [isSupportDocumentCancellation, items, setValue]);

  return (
    <section className="space-y-5">
      <PageHeader size="sm">
        <PageHeaderContent>
          <PageHeaderTitle>Productos a ajustar</PageHeaderTitle>
          <PageHeaderDescription>
            {isSupportDocumentCancellation
              ? "La anulación aplica sobre el documento soporte completo con todas sus cantidades originales."
              : "Indica la cantidad de cada producto que vas a incluir en la nota de ajuste."}
          </PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>

      <div className="border-border/60 overflow-hidden border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead className="text-right">Máximo</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead className="text-right">Precio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={item.codeReference}>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {item.codeReference}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">{item.maxQuantity}</TableCell>
                <TableCell className="w-36 min-w-36 text-right">
                  <Controller
                    control={control}
                    name={`items.${index}.quantity`}
                    render={({ field, fieldState }) => (
                      <Field>
                        <Input
                          type="number"
                          min={0}
                          max={item.maxQuantity}
                          step="0.001"
                          value={field.value}
                          disabled={isSupportDocumentCancellation}
                          onChange={(event) => {
                            const value = event.target.value;
                            field.onChange(value === "" ? 0 : Number(value));
                          }}
                          aria-invalid={fieldState.invalid}
                          className="text-right"
                        />
                        <FieldError errors={[fieldState.error]} />
                      </Field>
                    )}
                  />
                </TableCell>
                <TableCell className="text-right">
                  {COP.format(item.price)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {itemsRootError ? <FieldError errors={[itemsRootError]} /> : null}
    </section>
  );
};

export default ItemsFieldset;
