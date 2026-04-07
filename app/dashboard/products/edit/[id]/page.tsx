import { notFound } from "next/navigation";
import type { FC } from "react";
import BackButton from "@/components/back-button";
import {
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/dashboard/page-header";
import ProductForm from "@/components/dashboard/products/product-form";
import { FactusService } from "@/elysia/modules/factus/service";
import {
  type ProductDetailResult,
  ProductService,
} from "@/elysia/modules/products/service";
import { requireUser } from "@/lib/dal";

interface PageProps {
  params: Promise<{ id: string }>;
}

const Page: FC<PageProps> = async ({ params }) => {
  const { id } = await params;
  const user = await requireUser();

  let product: ProductDetailResult;
  try {
    product = await ProductService.get(user.id, id);
  } catch {
    notFound();
  }

  let measurementUnits: Awaited<
    ReturnType<typeof FactusService.getMeasurementUnits>
  > = [];
  let tributes: Awaited<ReturnType<typeof FactusService.getTributes>> = [];

  const [measurementUnitsResult, tributesResult] = await Promise.allSettled([
    FactusService.getMeasurementUnits(user.id),
    FactusService.getTributes(user.id),
  ]);

  if (measurementUnitsResult.status === "fulfilled")
    measurementUnits = measurementUnitsResult.value;
  if (tributesResult.status === "fulfilled") tributes = tributesResult.value;

  return (
    <div className="flex min-h-full w-full flex-1 flex-col gap-6">
      <PageHeader>
        <PageHeaderContent>
          <BackButton href="/dashboard/products" />
          <PageHeaderTitle>Editar producto</PageHeaderTitle>
          <PageHeaderDescription>
            &#47;&#47; Actualiza los datos del producto o servicio
          </PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>
      <ProductForm
        measurementUnits={measurementUnits}
        tributes={tributes}
        selectedProduct={product}
      />
    </div>
  );
};

export default Page;
