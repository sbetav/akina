"use client";

import type { VariantProps } from "class-variance-authority";
import { DownloadIcon } from "lucide-react";
import { Button, type buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useDownloadInvoicePdf } from "@/hooks/api/use-download-invoice-pdf";

interface InvoiceDownloadPdfButtonProps {
  invoiceId: string;
  invoiceNumber: string;
  label?: string;
  size?: VariantProps<typeof buttonVariants>["size"];
  variant?: VariantProps<typeof buttonVariants>["variant"];
}

export function InvoiceDownloadPdfButton({
  invoiceId,
  invoiceNumber,
  label = "Descargar PDF",
  size = "lg",
  variant = "default-subtle",
}: InvoiceDownloadPdfButtonProps) {
  const { downloadPdf, isPending } = useDownloadInvoicePdf();

  return (
    <Button
      size={size}
      variant={variant}
      disabled={isPending}
      onClick={() => downloadPdf({ invoiceId, invoiceNumber })}
    >
      {isPending ? <Spinner /> : <DownloadIcon />}
      {label}
    </Button>
  );
}
