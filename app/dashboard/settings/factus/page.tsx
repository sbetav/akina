import {
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/dashboard/page-header";
import CredentialsList from "@/components/dashboard/settings/factus/credentials-list";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

export default function Page() {
  return (
    <div className="flex min-h-full w-full flex-1 flex-col gap-6">
      <PageHeader size="sm">
        <PageHeaderContent>
          <PageHeaderTitle>Conexión a Factus</PageHeaderTitle>
          <PageHeaderDescription className="normal-case">
            &#47;&#47; Conecta Akina con Factus y comienza a emitir documentos
            electrónicos
          </PageHeaderDescription>
        </PageHeaderContent>
        <PageHeaderActions>
          <Link
            href="/dashboard/settings/factus/new-credential"
            className={buttonVariants({})}
          >
            <PlusIcon /> Nueva credencial
          </Link>
        </PageHeaderActions>
      </PageHeader>

      <Separator />

      <CredentialsList />

      <div className="flex justify-center">
        <p className="text-muted-foreground text-center text-xs">
          ¿Donde obtener mis credenciales?{" "}
          <span className="text-foreground">Visita la</span>{" "}
          <Link
            href="https://www.factus.com.co/"
            target="_blank"
            className="text-primary/90 hover:text-primary transition-all hover:underline"
          >
            Página oficial de Factus
          </Link>
        </p>
      </div>
    </div>
  );
}
