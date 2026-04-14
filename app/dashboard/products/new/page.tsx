import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import BackButton from "@/components/back-button";
import {
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/dashboard/page-header";
import ProductForm from "@/components/dashboard/products/product-form";
import { FactusService } from "@/elysia/modules/factus/service";
import { ProductService } from "@/elysia/modules/products/service";
import { requireUser } from "@/lib/dal";
import { getQueryClient } from "@/lib/query-client";
import {
  MEASUREMENT_UNITS_QUERY_KEY,
  TRIBUTES_QUERY_KEY,
} from "@/lib/query-keys";

const Page = async () => {
  const user = await requireUser();
  const queryClient = getQueryClient();

  let initialCode: string | undefined;

  const [initialCodeResult] = await Promise.allSettled([
    ProductService.nextCode(user.id),
    queryClient.prefetchQuery({
      queryKey: [...MEASUREMENT_UNITS_QUERY_KEY],
      queryFn: () => FactusService.getMeasurementUnits(user.id),
    }),
    queryClient.prefetchQuery({
      queryKey: [...TRIBUTES_QUERY_KEY],
      queryFn: () => FactusService.getTributes(user.id),
    }),
  ]);

  if (initialCodeResult.status === "fulfilled")
    initialCode = initialCodeResult.value;

  return (
    <div className="flex min-h-full w-full flex-1 flex-col gap-6">
      <PageHeader>
        <PageHeaderContent>
          <BackButton mode="redirect" href="/dashboard/products" />
          <PageHeaderTitle>Nuevo producto</PageHeaderTitle>
          <PageHeaderDescription>
            &#47;&#47; Ingresa los datos del producto o servicio
          </PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProductForm initialCode={initialCode} />
      </HydrationBoundary>
    </div>
  );
};

export default Page;
