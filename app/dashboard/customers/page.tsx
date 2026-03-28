import CustomersTable from "@/components/dashboard/customers/customers-table";
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/dashboard/page-header";
import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/lib/dal";
import { CustomerService } from "@/lib/elysia/modules/customers/service";
import { getQueryClient } from "@/lib/query-client";
import { CUSTOMERS_QUERY_KEY, DEFAULT_CUSTOMERS_LIMIT } from "@/lib/query-keys";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { FC } from "react";

const Page: FC = async () => {
  const user = await requireUser();
  const queryClient = getQueryClient();

  await queryClient.fetchQuery({
    queryKey: [
      ...CUSTOMERS_QUERY_KEY,
      { search: "", page: 1, limit: DEFAULT_CUSTOMERS_LIMIT },
    ],
    queryFn: () =>
      CustomerService.list(user.id, {
        page: 1,
        limit: DEFAULT_CUSTOMERS_LIMIT,
      }),
  });

  return (
    <div className="flex min-h-full w-full flex-1 flex-col gap-6">
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle>Clientes</PageHeaderTitle>
          <PageHeaderDescription>
            &#47;&#47; Gestión de terceros
          </PageHeaderDescription>
        </PageHeaderContent>
        <PageHeaderActions>
          <Link
            href="/dashboard/customers/new"
            className={buttonVariants({ size: "lg" })}
          >
            <PlusIcon />
            Nuevo cliente
          </Link>
        </PageHeaderActions>
      </PageHeader>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <CustomersTable />
      </HydrationBoundary>
    </div>
  );
};

export default Page;
