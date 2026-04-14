import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
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
import { getQueryClient } from "@/lib/query-client";
import {
  MEASUREMENT_UNITS_QUERY_KEY,
  TRIBUTES_QUERY_KEY,
} from "@/lib/query-keys";

interface PageProps {
  params: Promise<{ id: string }>;
}

const Page: FC<PageProps> = async ({ params }) => {
  const { id } = await params;
  const user = await requireUser();
  const queryClient = getQueryClient();

  let product: ProductDetailResult;
  try {
    product = await ProductService.get(user.id, id);
  } catch {
    notFound();
  }

  await Promise.allSettled([
    queryClient.prefetchQuery({
      queryKey: [...MEASUREMENT_UNITS_QUERY_KEY],
      queryFn: () => FactusService.getMeasurementUnits(user.id),
    }),
    queryClient.prefetchQuery({
      queryKey: [...TRIBUTES_QUERY_KEY],
      queryFn: () => FactusService.getTributes(user.id),
    }),
  ]);

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
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProductForm selectedProduct={product} />
      </HydrationBoundary>
    </div>
  );
};

export default Page;
