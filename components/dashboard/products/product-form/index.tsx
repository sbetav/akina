"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useGoBack } from "@/hooks/ui/use-go-back";
import { api } from "@/lib/elysia/eden";
import { ProductDetailResult } from "@/lib/elysia/modules/products/service";
import { PRODUCTS_QUERY_KEY } from "@/lib/query-keys";
import {
  ProductFormValues,
  productFormSchema,
} from "@/lib/validations/product";
import { useRouter } from "@bprogress/next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MeasurementUnit, Tribute } from "factus-js";
import { SaveIcon } from "lucide-react";
import { FC } from "react";
import { FormProvider, useForm } from "react-hook-form";
import DashboardCard from "../../dashboard-card";
import { CatalogFieldSet } from "./catalog-fieldset";
import { DetailsFieldSet } from "./details-fieldset";
import { PricingFieldSet } from "./pricing-fieldset";

interface ProductFormProps {
  selectedProduct?: ProductDetailResult;
  measurementUnits: MeasurementUnit[];
  tributes: Tribute[];
  initialCode?: string;
}

const ProductForm: FC<ProductFormProps> = ({
  selectedProduct,
  measurementUnits,
  tributes,
  initialCode,
}) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { goBack } = useGoBack({ fallbackHref: "/dashboard/products" });

  const methods = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      code: selectedProduct?.code ?? initialCode,
      name: selectedProduct?.name ?? "",
      description: selectedProduct?.description ?? "",
      price: selectedProduct?.price ?? 0,
      unitMeasureId:
        selectedProduct?.unitMeasureId ??
        measurementUnits[0]?.id.toString() ??
        "",
      standardCodeId: selectedProduct?.standardCodeId ?? "1",
      tributeId: selectedProduct?.tributeId ?? tributes[0]?.id.toString() ?? "",
      taxRate: selectedProduct?.taxRate ?? 0,
      isExcluded: selectedProduct?.isExcluded ?? false,
      type: selectedProduct?.type ?? "product",
    },
  });

  const { handleSubmit, control } = methods;

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      if (selectedProduct) {
        const res = await api.products({ id: selectedProduct.id }).put(values);
        if (res.error)
          throw new Error(
            (res.error as { value?: { error?: string } }).value?.error ??
              "Error al actualizar el producto",
          );
        return res.data;
      }
      const res = await api.products.post(values);
      if (res.error)
        throw new Error(
          (res.error as { value?: { error?: string } }).value?.error ??
            "Error al crear el producto",
        );
      return res.data;
    },
    onSuccess: () => {
      toast.success(
        `Producto ${selectedProduct ? "actualizado" : "creado"} exitosamente`,
      );
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      router.replace("/dashboard/products");
    },
    onError: () =>
      toast.error(
        `Error al ${selectedProduct ? "actualizar" : "crear"} el producto`,
      ),
  });

  return (
    <DashboardCard className="flex flex-1">
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit((data) => mutate(data))}
          className="flex w-full flex-col gap-8"
        >
          <div className="flex flex-1 flex-col gap-8">
            <DetailsFieldSet editMode={!!selectedProduct} />
            <PricingFieldSet />
            <CatalogFieldSet
              control={control}
              measurementUnits={measurementUnits}
              tributes={tributes}
            />
          </div>

          <div className="flex w-full flex-col-reverse items-center justify-end gap-3 md:flex-row">
            <Button
              size="lg"
              type="button"
              variant="outline"
              className="w-full md:w-auto"
              onClick={goBack}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              size="lg"
              type="submit"
              className="w-full md:w-auto"
              disabled={isPending}
            >
              {isPending ? <Spinner /> : <SaveIcon />}
              Guardar
            </Button>
          </div>
        </form>
      </FormProvider>
    </DashboardCard>
  );
};

export default ProductForm;
