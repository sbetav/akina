import type { ViewSupportDocumentData } from "factus-js";
import { ExternalLinkIcon, FileTextIcon } from "lucide-react";
import { notFound } from "next/navigation";
import BackButton from "@/components/back-button";
import DashboardCard from "@/components/dashboard/dashboard-card";
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/dashboard/page-header";
import { SupportDocumentDownloadPdfButton } from "@/components/dashboard/support-documents/support-document-download-pdf-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NotFoundError } from "@/elysia/errors";
import { SupportDocumentService } from "@/elysia/modules/support-documents/service";
import { requireUser } from "@/lib/dal";
import {
  formatDocumentCurrency,
  formatDocumentDate,
  getDocumentValidationStatus,
} from "@/lib/documents/display";
import { formatDocumentNumber } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

const Page = async ({ params }: PageProps) => {
  const { id } = await params;
  const user = await requireUser();

  let document: ViewSupportDocumentData;
  try {
    document = await SupportDocumentService.getFromFactus(user.id, id);
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }
    throw error;
  }

  const { support_document, provider, adjustment_notes, items } = document;
  const status = getDocumentValidationStatus(support_document.status);
  const providerName = provider.trade_name || provider.names || "N/A";

  return (
    <div className="flex min-h-full w-full flex-1 flex-col gap-6">
      <PageHeader>
        <PageHeaderContent>
          <BackButton mode="redirect" href="/dashboard/support-documents" />
          <PageHeaderTitle>
            Documento soporte {support_document.number}
          </PageHeaderTitle>
          <PageHeaderDescription>
            &#47;&#47; Detalle del documento soporte
          </PageHeaderDescription>
        </PageHeaderContent>
        <PageHeaderActions>
          <a
            href={support_document.qr}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({
              size: "lg",
              variant: "secondary",
            })}
          >
            <ExternalLinkIcon />
            Ver en la DIAN
          </a>
          <SupportDocumentDownloadPdfButton
            documentId={id}
            documentNumber={support_document.number}
          />
        </PageHeaderActions>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <DashboardCard className="space-y-3 xl:col-span-2">
          <h3 className="font-sans text-lg font-medium">Información general</h3>
          <div className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm md:grid-cols-2">
            <div className="flex items-center justify-between gap-3 md:block">
              <p className="text-muted-foreground text-xs uppercase">Estado</p>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            <Detail
              label="Referencia"
              value={support_document.reference_code}
            />
            <Detail label="CUDS" value={support_document.cuds} />
            <Detail
              label="Fecha de emisión"
              value={formatDocumentDate(support_document.created_at)}
            />
            <Detail
              label="Fecha de validación"
              value={formatDocumentDate(support_document.validated)}
            />
            <Detail
              label="Método de pago"
              value={support_document.payment_method.name || "N/A"}
            />
            <Detail
              label="Envío por email"
              value={support_document.send_email ? "Sí" : "No"}
            />
            <Detail
              className="md:col-span-2"
              label="Observación"
              value={support_document.observation || "Sin observación"}
            />
          </div>
        </DashboardCard>

        <DashboardCard className="space-y-3">
          <h3 className="font-sans text-lg font-medium">Proveedor</h3>
          <div className="space-y-3 text-sm">
            <Detail label="Nombre" value={providerName} />
            <Detail
              label="Identificación"
              value={formatDocumentNumber(provider.identification)}
            />
            <Detail label="Email" value={provider.email || "N/A"} />
            <Detail label="Teléfono" value={provider.phone || "N/A"} />
            <Detail label="Dirección" value={provider.address || "N/A"} />
            <Detail
              label="Municipio"
              value={provider.municipality?.name || "N/A"}
            />
          </div>
        </DashboardCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <DashboardCard className="w-full space-y-4 xl:col-span-2">
          <div>
            <h3 className="font-sans text-lg font-medium">
              Productos facturados
            </h3>
            <p className="text-muted-foreground text-xs">
              Un total de {items.length} productos facturados
            </p>
          </div>

          <div className="bg-background/30 border-border/60 border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead className="text-right">Descuento</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={`${item.code_reference}-${item.name}`}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-muted-foreground text-xs">
                          {item.code_reference}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatDocumentCurrency(item.price)}
                    </TableCell>
                    <TableCell className="text-right">
                      {parseFloat(item.discount_rate)}%
                    </TableCell>
                    <TableCell className="text-right">
                      {formatDocumentCurrency(item.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DashboardCard>

        <div className="w-full">
          <DashboardCard className="space-y-3">
            <h3 className="font-sans text-lg font-medium">Totales</h3>
            <TotalRow
              label="Bruto"
              value={formatDocumentCurrency(support_document.gross_value)}
            />
            <TotalRow
              label="Descuentos"
              value={formatDocumentCurrency(support_document.discount_amount)}
            />
            <Separator className="my-3" />
            <TotalRow
              label="Total"
              value={formatDocumentCurrency(support_document.total)}
              strong
            />
          </DashboardCard>
        </div>
      </div>

      <DashboardCard className="space-y-4">
        <div>
          <h3 className="font-sans text-lg font-medium">Notas de ajuste</h3>
          <p className="text-muted-foreground text-xs">
            Notas de ajuste emitidas para este documento soporte.
          </p>
        </div>

        {adjustment_notes.length === 0 ? (
          <Empty className="bg-background/30 border border-dashed py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FileTextIcon />
              </EmptyMedia>
              <EmptyTitle>Sin notas de ajuste aún</EmptyTitle>
              <EmptyDescription className="max-w-[360px]">
                Las notas de ajuste emitidas para este documento soporte
                aparecerán aquí.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-3">
            {adjustment_notes.map((note) => {
              const noteStatus = getDocumentValidationStatus(note.status);

              return (
                <div
                  key={note.id}
                  className="border-border/60 flex flex-col gap-4 border p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-x-16 gap-y-6 md:flex-row md:flex-wrap md:items-start">
                    <Detail label="Número" value={note.number} />
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-xs uppercase">
                        Estado
                      </p>
                      <Badge variant={noteStatus.variant}>
                        {noteStatus.label}
                      </Badge>
                    </div>
                    <Detail label="Referencia" value={note.reference_code} />
                    <Detail
                      label="Fecha"
                      value={formatDocumentDate(note.created_at)}
                    />
                    <Detail
                      label="Total"
                      value={formatDocumentCurrency(note.total)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DashboardCard>
    </div>
  );
};

interface DetailProps {
  label: string;
  value: string;
  className?: string;
}

function Detail({ label, value, className }: DetailProps) {
  return (
    <div className={className}>
      <p className="text-muted-foreground text-xs uppercase">{label}</p>
      <p className="text-sm font-medium break-all">{value}</p>
    </div>
  );
}

interface TotalRowProps {
  label: string;
  value: string;
  strong?: boolean;
}

function TotalRow({ label, value, strong = false }: TotalRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={strong ? "font-semibold" : "font-medium"}>{value}</span>
    </div>
  );
}

export default Page;
