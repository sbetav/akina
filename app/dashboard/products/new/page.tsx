import BackButton from "@/components/back-button";
import {
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/dashboard/page-header";
import ProductForm from "@/components/dashboard/products/product-form";
import { requireUser } from "@/lib/dal";
import { FactusService } from "@/lib/elysia/modules/factus/service";
import { ProductService } from "@/lib/elysia/modules/products/service";

const Page = async () => {
  const user = await requireUser();

  let measurementUnits: Awaited<
    ReturnType<typeof FactusService.getMeasurementUnits>
  > = [];
  let tributes: Awaited<ReturnType<typeof FactusService.getTributes>> = [];
  let initialCode: string | undefined;

  const [measurementUnitsResult, tributesResult, initialCodeResult] =
    await Promise.allSettled([
      FactusService.getMeasurementUnits(user.id),
      FactusService.getTributes(user.id),
      ProductService.nextCode(user.id),
    ]);

  if (measurementUnitsResult.status === "fulfilled")
    measurementUnits = measurementUnitsResult.value;
  if (tributesResult.status === "fulfilled") tributes = tributesResult.value;
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

      <ProductForm
        measurementUnits={measurementUnits}
        tributes={tributes}
        initialCode={initialCode}
      />
    </div>
  );
};

export default Page;
