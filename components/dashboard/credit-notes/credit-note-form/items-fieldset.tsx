"use client";

import { CreditNoteCorrectionCode } from "factus-js";
import { type FC, useEffect } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import {
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
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
import type { CreditNoteFormValues } from "@/lib/validations/credit-note";

const ItemsFieldset: FC = () => {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<CreditNoteFormValues>();
  const items = useWatch({ control, name: "items" }) ?? [];
  const itemsRootError = errors.items?.root;
  const correctionConceptCode = useWatch({
    control,
    name: "correctionConceptCode",
  });
  const isInvoiceCancellation =
    correctionConceptCode === CreditNoteCorrectionCode.InvoiceCancellation;

  useEffect(() => {
    if (!isInvoiceCancellation) return;

    items.forEach((item, index) => {
      if (item.quantity === item.maxQuantity) return;

      setValue(`items.${index}.quantity`, item.maxQuantity, {
        shouldDirty: true,
        shouldValidate: true,
      });
    });
  }, [isInvoiceCancellation, items, setValue]);

  return (
    <section className="space-y-5">
      <PageHeader size="sm">
        <PageHeaderContent>
          <PageHeaderTitle>Productos a acreditar</PageHeaderTitle>
          <PageHeaderDescription>
            {isInvoiceCancellation
              ? "La anulación aplica sobre la factura completa con todas sus cantidades originales."
              : "Indica la cantidad de cada producto que vas a incluir en la nota crédito."}
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
              <TableRow key={item.code}>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-xs">
                        {item.code}
                      </span>
                      {item.isExcluded && (
                        <Badge variant="secondary">Excluido</Badge>
                      )}
                    </div>
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
                          disabled={isInvoiceCancellation}
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
