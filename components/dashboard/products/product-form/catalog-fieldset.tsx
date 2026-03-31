"use client";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import {
  Select,
  SelectAddon,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductFormValues } from "@/lib/validations/product";
import { MeasurementUnit, ProductStandardId, Tribute } from "factus-js";
import { BarChart2Icon, BookOpenIcon, RulerIcon } from "lucide-react";
import { Control, Controller } from "react-hook-form";

const productStandards = Object.values(ProductStandardId);

interface CatalogFieldSetProps {
  control: Control<ProductFormValues>;
  measurementUnits: MeasurementUnit[];
  tributes: Tribute[];
}

export function CatalogFieldSet({
  control,
  measurementUnits,
  tributes,
}: CatalogFieldSetProps) {
  return (
    <FieldSet>
      <FieldLegend>Clasificación</FieldLegend>
      <FieldGroup>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Controller
            control={control}
            name="unitMeasureId"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Unidad de medida</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    className="w-ful capitalize"
                  >
                    <SelectAddon>
                      <RulerIcon />
                    </SelectAddon>
                    <SelectValue placeholder="Selecciona una unidad">
                      {(value: string) => {
                        const match = measurementUnits?.find(
                          (u) => String(u.id) === value,
                        );
                        return (
                          (match?.name ?? value) || "Selecciona una unidad"
                        );
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {measurementUnits?.map((unit) => (
                      <SelectItem
                        key={unit.id}
                        value={String(unit.id)}
                        className="capitalize"
                      >
                        {unit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="standardCodeId"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Código estándar</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    className="w-full"
                  >
                    <SelectAddon>
                      <BookOpenIcon />
                    </SelectAddon>
                    <SelectValue placeholder="Selecciona un estándar">
                      {(value: string) => {
                        const match = productStandards.find(
                          (s) => s.value === value,
                        );
                        return (
                          (match?.description ?? value) ||
                          "Selecciona un estándar"
                        );
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {productStandards.map((standard) => (
                      <SelectItem key={standard.value} value={standard.value}>
                        {standard.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="tributeId"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Tributo</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    className="w-full"
                  >
                    <SelectAddon>
                      <BarChart2Icon />
                    </SelectAddon>
                    <SelectValue placeholder="Selecciona un tributo">
                      {(value: string) => {
                        const match = tributes?.find(
                          (t) => String(t.id) === value,
                        );
                        return (
                          (match?.name ?? value) || "Selecciona un tributo"
                        );
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {tributes?.map((tribute) => (
                      <SelectItem key={tribute.id} value={String(tribute.id)}>
                        {tribute.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </div>
      </FieldGroup>
    </FieldSet>
  );
}
