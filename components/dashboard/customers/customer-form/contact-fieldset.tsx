"use client";

import type { Municipality } from "factus-js";
import { MailIcon, MapPinHouseIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import { useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import PhoneInput from "react-phone-number-input/input";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
} from "@/components/ui/combobox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import type { CustomerFormValues } from "@/lib/validations/customer";
import {
  type MunicipalityVirtualizer,
  VirtualizedMunicipalityList,
} from "./virtualized-municipality-list";

interface ContactFieldSetProps {
  municipalities: Municipality[];
}

export function ContactFieldSet({ municipalities }: ContactFieldSetProps) {
  const { control } = useFormContext<CustomerFormValues>();
  const virtualizerRef = useRef<MunicipalityVirtualizer | null>(null);

  return (
    <FieldSet>
      <FieldLegend>Contacto</FieldLegend>
      <FieldGroup>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Controller
            control={control}
            name="email"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>
                  Correo electrónico{" "}
                  <span className="text-muted-foreground font-normal">
                    (opcional)
                  </span>
                </FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <MailIcon />
                  </InputGroupAddon>
                  <InputGroupInput
                    id={field.name}
                    type="email"
                    placeholder="correo@ejemplo.com"
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                </InputGroup>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>
                  Teléfono{" "}
                  <span className="text-muted-foreground font-normal">
                    (opcional)
                  </span>
                </FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <PhoneIcon />
                  </InputGroupAddon>
                  <PhoneInput
                    country="CO"
                    id={field.name}
                    placeholder="300 1234567"
                    aria-invalid={fieldState.invalid}
                    inputComponent={InputGroupInput}
                    {...field}
                    onChange={(value) =>
                      setTimeout(() => field.onChange(value ?? ""), 1)
                    }
                  />
                </InputGroup>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="municipalityId"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>
                  Municipio{" "}
                  <span className="text-muted-foreground font-normal">
                    (opcional)
                  </span>
                </FieldLabel>
                <Combobox
                  id={field.name}
                  virtualized
                  items={municipalities}
                  itemToStringLabel={(municipality: Municipality) =>
                    `${municipality.name} - ${municipality.department}`
                  }
                  itemToStringValue={(municipality: Municipality) =>
                    String(municipality.id)
                  }
                  onItemHighlighted={(item, { reason, index }) => {
                    const virtualizer = virtualizerRef.current;
                    if (!item || !virtualizer) return;

                    const isStart = index === 0;
                    const isEnd = index === virtualizer.options.count - 1;
                    const shouldScroll =
                      reason === "none" ||
                      (reason === "keyboard" && (isStart || isEnd));

                    if (shouldScroll) {
                      queueMicrotask(() => {
                        virtualizer.scrollToIndex(index, {
                          align: isEnd ? "start" : "end",
                        });
                      });
                    }
                  }}
                  value={
                    field.value
                      ? (municipalities.find(
                          (m) => String(m.id) === field.value,
                        ) ?? null)
                      : null
                  }
                  onValueChange={(item) =>
                    field.onChange(item ? String(item.id) : "")
                  }
                >
                  <ComboboxInput
                    placeholder="Buscar municipio"
                    aria-invalid={fieldState.invalid}
                    showClear
                  >
                    <InputGroupAddon>
                      <MapPinIcon />
                    </InputGroupAddon>
                  </ComboboxInput>
                  <ComboboxContent>
                    <ComboboxEmpty>No se encontraron resultados.</ComboboxEmpty>
                    <VirtualizedMunicipalityList
                      virtualizerRef={virtualizerRef}
                    />
                  </ComboboxContent>
                </Combobox>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="address"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>
                  Dirección{" "}
                  <span className="text-muted-foreground font-normal">
                    (opcional)
                  </span>
                </FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <MapPinHouseIcon />
                  </InputGroupAddon>
                  <InputGroupInput
                    id={field.name}
                    placeholder="Calle 123 # 45-67"
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                </InputGroup>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </div>
      </FieldGroup>
    </FieldSet>
  );
}
