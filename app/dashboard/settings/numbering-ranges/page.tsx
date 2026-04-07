"use client";

import {
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/dashboard/page-header";
import CreateNumberingRangeDialog from "@/components/dashboard/settings/numbering-ranges/create-numbering-range-dialog";
import NumberingRangesList from "@/components/dashboard/settings/numbering-ranges/numbering-ranges-list";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useCredentialsContext } from "@/contexts/credentials-context";
import useHasPendingQueries from "@/hooks/ui/use-pending-queries";
import { NUMBERING_RANGES_QUERY_KEY } from "@/lib/query-keys";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { FC } from "react";

const CREDENTIALS_HREF = "/dashboard/settings/factus";

const CredentialsLink: FC = () => (
  <Link
    href={CREDENTIALS_HREF}
    className="group mt-2 flex items-center gap-1 text-xs hover:underline"
  >
    Administrar credenciales{" "}
    <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
  </Link>
);

const Page: FC = () => {
  const { isAkinaSandbox, isActivating } = useCredentialsContext();

  const pendingRanges = useHasPendingQueries(NUMBERING_RANGES_QUERY_KEY);

  const rangesBusy = isActivating || pendingRanges;

  return (
    <div className="flex min-h-full w-full flex-1 flex-col gap-6">
      <PageHeader size="sm">
        <PageHeaderContent>
          <PageHeaderTitle>Rangos de numeración</PageHeaderTitle>
          <PageHeaderDescription className="normal-case">
            &#47;&#47; Gestiona los rangos de numeración de los documentos
            electrónicos
          </PageHeaderDescription>
        </PageHeaderContent>
        <PageHeaderActions>
          <CreateNumberingRangeDialog isDisabled={rangesBusy} />
        </PageHeaderActions>
      </PageHeader>

      {rangesBusy ? (
        <Skeleton className="h-[94px] w-full" />
      ) : isAkinaSandbox ? (
        <Alert variant="warning">
          <AlertTitle>Modo sandbox</AlertTitle>
          <AlertDescription>
            No puedes crear o actualizar rangos de numeración en el modo sandbox
            de Akina.
          </AlertDescription>
          <AlertAction>
            <CredentialsLink />
          </AlertAction>
        </Alert>
      ) : (
        <Alert variant="info">
          <AlertTitle>Información</AlertTitle>
          <AlertDescription>
            Los rangos de numeración están vinculados a tus credenciales de
            Factus activas.
          </AlertDescription>
          <AlertAction>
            <CredentialsLink />
          </AlertAction>
        </Alert>
      )}

      <NumberingRangesList />
    </div>
  );
};

export default Page;
