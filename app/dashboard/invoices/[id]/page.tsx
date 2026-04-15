import type { ViewBillData } from "factus-js";
import { ExternalLinkIcon, FileTextIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import BackButton from "@/components/back-button";
import { CreditNoteDetailsDialog } from "@/components/dashboard/credit-notes/credit-note-details-dialog";
import { CreditNoteDownloadPdfButton } from "@/components/dashboard/credit-notes/credit-note-download-pdf-button";
import DashboardCard from "@/components/dashboard/dashboard-card";
import { InvoiceDownloadPdfButton } from "@/components/dashboard/invoices/invoice-download-pdf-button";
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/dashboard/page-header";
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
import { CreditNoteService } from "@/elysia/modules/credit-notes/service";
import { InvoiceService } from "@/elysia/modules/invoices/service";
import { requireUser } from "@/lib/dal";
import {
  formatDocumentCurrency,
  formatDocumentDate,
  getBillCustomerName,
} from "@/lib/documents/display";
import { getInvoiceStatusDisplay } from "@/lib/invoices/utils";
import { formatDocumentNumber } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

const Page = async ({ params }: PageProps) => {
  const { id } = await params;
  const user = await requireUser();

  let invoice: ViewBillData;
  let creditNotes: Awaited<ReturnType<typeof CreditNoteService.listForInvoice>>;
  try {
    [invoice, creditNotes] = await Promise.all([
      InvoiceService.getFromFactus(user.id, id),
      CreditNoteService.listForInvoice(user.id, id),
    ]);
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }
    throw error;
  }

  const status = getInvoiceStatusDisplay(invoice.bill.status);

  return (
    <div className="flex min-h-full w-full flex-1 flex-col gap-6">
      <PageHeader>
        <PageHeaderContent>
          <BackButton mode="redirect" href="/dashboard/invoices" />
          <PageHeaderTitle>Factura {invoice.bill.number}</PageHeaderTitle>
          <PageHeaderDescription>
            &#47;&#47; Detalle de la factura electrónica
          </PageHeaderDescription>
        </PageHeaderContent>
        <PageHeaderActions>
          <a
            href={invoice.bill.qr}
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
          <InvoiceDownloadPdfButton
            invoiceId={id}
            invoiceNumber={invoice.bill.number}
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
            <Detail label="Referencia" value={invoice.bill.reference_code} />
            <Detail label="CUFE" value={invoice.bill.cufe} />
            <Detail
              label="Fecha de emisión"
              value={formatDocumentDate(invoice.bill.created_at)}
            />
            <Detail
              label="Fecha de validación"
              value={formatDocumentDate(invoice.bill.validated)}
            />
            <Detail
              label="Forma de pago"
              value={invoice.bill.payment_form.name || "N/A"}
            />
            <Detail
              label="Método de pago"
              value={invoice.bill.payment_method.name || "N/A"}
            />
            <Detail
              label="Fecha de vencimiento"
              value={invoice.bill.payment_due_date || "N/A"}
            />
            <Detail
              label="Envío por email"
              value={invoice.bill.send_email ? "Sí" : "No"}
            />
            <Detail
              className="md:col-span-2"
              label="Observación"
              value={invoice.bill.observation || "Sin observación"}
            />
          </div>
        </DashboardCard>

        <DashboardCard className="space-y-3">
          <h3 className="font-sans text-lg font-medium">Cliente</h3>
          <div className="space-y-3 text-sm">
            <Detail label="Nombre" value={getBillCustomerName(invoice)} />
            <Detail
              label="Identificación"
              value={formatDocumentNumber(invoice.customer.identification)}
            />
            <Detail label="Email" value={invoice.customer.email || "N/A"} />
            <Detail label="Teléfono" value={invoice.customer.phone || "N/A"} />
            <Detail
              label="Dirección"
              value={invoice.customer.address || "N/A"}
            />
            <Detail
              label="Municipio"
              value={invoice.customer.municipality?.name || "N/A"}
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
              Un total de {invoice.items.length} productos facturados
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
                  <TableHead className="text-right">Impuesto</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map((item) => (
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
                      {item.discount_rate}%
                    </TableCell>
                    <TableCell className="text-right">
                      {item.tax_rate}%
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
              value={formatDocumentCurrency(invoice.bill.gross_value)}
            />
            <TotalRow
              label="Base gravable"
              value={formatDocumentCurrency(invoice.bill.taxable_amount)}
            />
            <TotalRow
              label="Impuestos"
              value={formatDocumentCurrency(invoice.bill.tax_amount)}
            />
            <TotalRow
              label="Descuentos"
              value={formatDocumentCurrency(invoice.bill.discount_amount)}
            />
            <TotalRow
              label="Recargos"
              value={formatDocumentCurrency(invoice.bill.surcharge_amount)}
            />
            <Separator className="my-3" />
            <TotalRow
              label="Total"
              value={formatDocumentCurrency(invoice.bill.total)}
              strong
            />
          </DashboardCard>
        </div>
      </div>

      <DashboardCard className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="font-sans text-lg font-medium">Notas crédito</h3>
            <p className="text-muted-foreground text-xs">
              Gestiona las notas crédito emitidas para esta factura.
            </p>
          </div>

          <Link
            href={`/dashboard/invoices/${id}/credit-notes/new`}
            className={buttonVariants()}
          >
            <PlusIcon />
            Crear nota crédito
          </Link>
        </div>

        {creditNotes.items.length === 0 ? (
          <Empty className="bg-background/30 border border-dashed py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FileTextIcon />
              </EmptyMedia>
              <EmptyTitle>Sin notas crédito aún</EmptyTitle>
              <EmptyDescription className="max-w-[360px]">
                Las notas crédito emitidas para esta factura aparecerán aquí.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-3">
            {creditNotes.items.map((creditNote) => {
              const creditNoteStatus = getInvoiceStatusDisplay(
                creditNote.status,
              );

              return (
                <div
                  key={creditNote.id}
                  className="border-border/60 flex flex-col gap-4 border p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-x-16 gap-y-6 md:flex-row md:flex-wrap md:items-start">
                    <Detail label="Número" value={creditNote.number} />
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-xs uppercase">
                        Estado
                      </p>
                      <Badge variant={creditNoteStatus.variant}>
                        {creditNoteStatus.label}
                      </Badge>
                    </div>
                    <Detail
                      label="Fecha"
                      value={formatDocumentDate(creditNote.createdAt)}
                    />
                    <Detail
                      label="Total"
                      value={formatDocumentCurrency(creditNote.total)}
                    />
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <CreditNoteDetailsDialog
                      creditNoteId={creditNote.id}
                      creditNoteNumber={creditNote.number}
                    />
                    <CreditNoteDownloadPdfButton
                      creditNoteId={creditNote.id}
                      creditNoteNumber={creditNote.number}
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
