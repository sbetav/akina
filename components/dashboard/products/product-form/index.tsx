"use client";

import { useRouter } from "@bprogress/next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { MeasurementUnit, Tribute } from "factus-js";
import { SaveIcon } from "lucide-react";
import { type FC, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { api } from "@/elysia/eden";
import { getApiErrorMessage } from "@/elysia/get-api-error-message";
import type { ProductDetailResult } from "@/elysia/modules/products/service";
import { useGoBack } from "@/hooks/ui/use-go-back";
import { PRODUCTS_QUERY_KEY } from "@/lib/query-keys";
import {
  type ProductFormValues,
  productFormSchema,
} from "@/lib/validations/product";
import DashboardCard from "../../dashboard-card";
import { DetailsFieldSet } from "./details-fieldset";
import { TaxesFieldSet } from "./taxes-fieldset";

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

  const DEFAULT_TRIBUTE_ID =
    tributes
      .find((tribute) => tribute.name.toLowerCase() === "iva")
      ?.id.toString() ?? tributes[0]?.id.toString();

  const DEFAULT_UNIT_MEASURE_ID =
    measurementUnits
      .find((unit) => unit.name.toLowerCase() === "unidad")
      ?.id.toString() ?? measurementUnits[0]?.id.toString();

  const methods = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      code: selectedProduct?.code ?? initialCode,
      name: selectedProduct?.name ?? "",
      description: selectedProduct?.description ?? "",
      price: selectedProduct?.price ?? 0,
      unitMeasureId:
        selectedProduct?.unitMeasureId ?? DEFAULT_UNIT_MEASURE_ID ?? "",
      standardCodeId: selectedProduct?.standardCodeId ?? "1",
      tributeId: selectedProduct?.tributeId ?? DEFAULT_TRIBUTE_ID ?? "",
      taxRate: selectedProduct?.taxRate ?? 0.19,
      isExcluded: selectedProduct?.isExcluded ?? false,
    },
  });

  const { handleSubmit } = methods;

  const [redirecting, setRedirecting] = useState(false);
  const { mutate, isPending } = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      if (selectedProduct) {
        const res = await api.products({ id: selectedProduct.id }).put(values);
        if (res.error)
          throw new Error(
            getApiErrorMessage(res.error, "Error al actualizar el producto"),
          );
        return res.data;
      }
      const res = await api.products.post(values);
      if (res.error)
        throw new Error(
          getApiErrorMessage(res.error, "Error al crear el producto"),
        );
      return res.data;
    },
    onSuccess: () => {
      setRedirecting(true);
      setTimeout(() => {
        toast.success(
          `Producto ${selectedProduct ? "actualizado" : "creado"} exitosamente`,
        );
        queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
        router.replace("/dashboard/products");
      }, 1);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <DashboardCard className="flex flex-1">
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit((data) => mutate(data))}
          className="flex w-full flex-col gap-8"
        >
          <div className="flex flex-1 flex-col gap-8">
            <DetailsFieldSet
              editMode={!!selectedProduct}
              disableReferenceCheck={redirecting}
              measurementUnits={measurementUnits}
            />
            <Separator />
            <TaxesFieldSet tributes={tributes} />
          </div>

          <div className="flex w-full flex-col-reverse items-center justify-end gap-3 md:flex-row">
            <Button
              size="lg"
              type="button"
              variant="outline"
              className="w-full md:w-auto"
              onClick={goBack}
              disabled={isPending || redirecting}
            >
              Cancelar
            </Button>
            <Button
              size="lg"
              type="submit"
              className="w-full md:w-auto"
              disabled={isPending || redirecting}
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
