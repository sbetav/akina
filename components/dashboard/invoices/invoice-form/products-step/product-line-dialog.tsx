"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PackageIcon } from "lucide-react";
import { type FC, useEffect, useMemo, useState } from "react";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { InputGroupAddon } from "@/components/ui/input-group";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { NumberInput } from "@/components/ui/number-input";
import { toast } from "@/components/ui/toast";
import type { ProductDetailResult } from "@/elysia/modules/products/service";
import { useProducts } from "@/hooks/api/use-products";
import { COP } from "@/lib/utils";
import {
  type InvoiceItemValues,
  invoiceItemSchema,
} from "@/lib/validations/invoice";

const addItemDialogSchema = z.object({
  productId: z.string().nonempty("Selecciona un producto"),
  quantity: z
    .number({ error: "Campo requerido" })
    .min(0.001, "La cantidad debe ser mayor a 0"),
  discountRate: z
    .number({ error: "Campo requerido" })
    .min(0, "Mínimo 0%")
    .max(100, "Máximo 100%"),
});

type AddItemDialogValues = z.infer<typeof addItemDialogSchema>;

export interface ProductLineDialogProps {
  open: boolean;
  onClose: () => void;
  selectedLine?: { index: number; item: InvoiceItemValues } | null;
  existingItems: InvoiceItemValues[];
  onAddProduct: (item: InvoiceItemValues) => boolean;
  onEditProduct: (item: InvoiceItemValues) => boolean;
}

const ProductLineDialog: FC<ProductLineDialogProps> = ({
  open,
  onClose,
  selectedLine,
  existingItems,
  onAddProduct,
  onEditProduct,
}) => {
  const editingItem = selectedLine?.item;
  const editingSearch = editingItem
    ? `${editingItem.name} (${editingItem.code})`
    : "";

  const [search, setSearch] = useState(editingSearch);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductDetailResult | null>(null);

  const { data, isFetching } = useProducts({ search, limit: 10 });

  const availableProducts = useMemo(() => {
    const selectedIds = new Set(existingItems.map((item) => item.productId));
    if (editingItem) selectedIds.delete(editingItem.productId);
    return (data?.items ?? []).filter(
      (product) => !selectedIds.has(product.id),
    );
  }, [data?.items, editingItem, existingItems]);

  const defaultValues = useMemo<AddItemDialogValues>(
    () => ({
      productId: editingItem?.productId ?? "",
      quantity: editingItem?.quantity ?? 1,
      discountRate: editingItem?.discountRate ?? 0,
    }),
    [editingItem],
  );

  const { control, handleSubmit, reset, watch, formState } =
    useForm<AddItemDialogValues>({
      resolver: zodResolver(addItemDialogSchema),
      values: defaultValues,
    });

  useEffect(() => {
    if (!open) return;
    setSearch(editingSearch);
    setSelectedProduct(null);
    reset(defaultValues);
  }, [open, editingSearch, defaultValues, reset]);

  const editingProductFallback = useMemo<ProductDetailResult | null>(() => {
    if (!editingItem) return null;
    return {
      id: editingItem.productId,
      code: editingItem.code,
      name: editingItem.name,
      description: null,
      price: editingItem.price,
      unitMeasureId: editingItem.unitMeasureId,
      standardCodeId: editingItem.standardCodeId,
      tributeId: editingItem.tributeId,
      taxRate: editingItem.taxRate,
      isExcluded: editingItem.isExcluded,
      createdAt: "",
      updatedAt: "",
    };
  }, [editingItem]);

  const comboboxItems = editingItem
    ? editingProductFallback
      ? [editingProductFallback]
      : []
    : availableProducts;

  const watchedProductId = watch("productId");

  const selectedProductFromList = useMemo(
    () => comboboxItems.find((item) => item.id === watchedProductId) ?? null,
    [comboboxItems, watchedProductId],
  );

  const selectedProductItem =
    selectedProductFromList ?? selectedProduct ?? editingProductFallback;

  const onSubmit: SubmitHandler<AddItemDialogValues> = (values) => {
    const product = selectedProductItem;
    if (!product) {
      toast.error("Selecciona un producto");
      return;
    }

    const parsed = invoiceItemSchema.safeParse({
      productId: product.id,
      code: product.code,
      name: product.name,
      price: Number(product.price),
      taxRate: Number(product.taxRate),
      unitMeasureId: product.unitMeasureId,
      standardCodeId: product.standardCodeId,
      isExcluded: product.isExcluded,
      tributeId: product.tributeId,
      quantity: values.quantity,
      discountRate: values.discountRate,
    });

    if (!parsed.success) {
      toast.error(
        parsed.error.issues[0]?.message ?? "Datos de producto inválidos",
      );
      return;
    }

    const success = editingItem
      ? onEditProduct(parsed.data)
      : onAddProduct(parsed.data);
    if (!success) return;

    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? "Editar producto" : "Agregar producto"}
          </DialogTitle>
          <DialogDescription>
            Selecciona un producto, define la cantidad y el descuento.
          </DialogDescription>
        </DialogHeader>

        <form
          id="product-line-form"
          onSubmit={(event) => {
            event.stopPropagation();
            void handleSubmit(onSubmit)(event);
          }}
        >
          <FieldGroup>
            <Controller
              control={control}
              name="productId"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Producto</FieldLabel>
                  <Combobox
                    filter={null}
                    items={comboboxItems}
                    itemToStringLabel={(product: ProductDetailResult) =>
                      `${product.name} (${product.code})`
                    }
                    itemToStringValue={(product: ProductDetailResult) =>
                      product.id
                    }
                    value={selectedProductItem}
                    onValueChange={(item) => {
                      const product = item ?? null;
                      setSelectedProduct(product);
                      field.onChange(product?.id ?? "");

                      if (!product?.id) return;

                      const duplicated = existingItems.some(
                        (existing) =>
                          existing.productId === product.id &&
                          existing.productId !== editingItem?.productId,
                      );

                      if (duplicated) toast.error("Producto ya agregado");
                    }}
                    inputValue={search}
                    onInputValueChange={setSearch}
                  >
                    <ComboboxInput
                      placeholder="Buscar por nombre o código"
                      showPending={isFetching}
                      disabled={!!editingItem}
                      onChange={(e) => setSearch(e.target.value)}
                      aria-invalid={fieldState.invalid}
                    >
                      <InputGroupAddon>
                        <PackageIcon className="size-4" />
                      </InputGroupAddon>
                    </ComboboxInput>

                    <ComboboxContent>
                      <ComboboxEmpty>
                        No se encontraron productos.
                      </ComboboxEmpty>
                      <ComboboxList>
                        {(product: ProductDetailResult) => (
                          <ComboboxItem key={product.id} value={product}>
                            <Item size="xs" className="p-0">
                              <ItemContent>
                                <ItemTitle>{product.name}</ItemTitle>
                                <ItemDescription>
                                  {product.code} · {COP.format(product.price)}
                                </ItemDescription>
                              </ItemContent>
                            </Item>
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Controller
                control={control}
                name="quantity"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Cantidad</FieldLabel>
                    <NumberInput
                      id={field.name}
                      min={0.001}
                      step={0.001}
                      placeholder="1"
                      aria-invalid={fieldState.invalid}
                      value={field.value}
                      onValueChange={(value) => field.onChange(value ?? 1)}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="discountRate"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Descuento (%)</FieldLabel>
                    <NumberInput
                      id={field.name}
                      min={0}
                      max={100}
                      step={0.01}
                      placeholder="0%"
                      aria-invalid={fieldState.invalid}
                      value={field.value}
                      onValueChange={(value) => field.onChange(value ?? 0)}
                      format={{
                        style: "percent",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      }}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button
            variant="outline"
            type="button"
            onClick={onClose}
            disabled={formState.isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="product-line-form"
            disabled={formState.isSubmitting}
          >
            {editingItem ? "Guardar" : "Agregar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductLineDialog;
