import {
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/dashboard/page-header";
import ProductsTable from "@/components/dashboard/products/products-table";
import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/lib/dal";
import { ProductService } from "@/lib/elysia/modules/products/service";
import { getQueryClient } from "@/lib/query-client";
import { DEFAULT_PRODUCTS_LIMIT, PRODUCTS_QUERY_KEY } from "@/lib/query-keys";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { FC } from "react";

const Page: FC = async () => {
  const user = await requireUser();
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: [
      ...PRODUCTS_QUERY_KEY,
      { search: "", page: 1, limit: DEFAULT_PRODUCTS_LIMIT },
    ],
    queryFn: () =>
      ProductService.list(user.id, {
        page: 1,
        limit: DEFAULT_PRODUCTS_LIMIT,
      }),
  });

  return (
    <div className="flex min-h-full w-full flex-1 flex-col gap-6">
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle>Productos</PageHeaderTitle>
          <PageHeaderDescription>
            &#47;&#47; Gestión de productos y servicios
          </PageHeaderDescription>
        </PageHeaderContent>
        <PageHeaderActions>
          <Link
            href="/dashboard/products/new"
            className={buttonVariants({ size: "lg" })}
          >
            <PlusIcon />
            Nuevo producto
          </Link>
        </PageHeaderActions>
      </PageHeader>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProductsTable />
      </HydrationBoundary>
    </div>
  );
};

export default Page;
