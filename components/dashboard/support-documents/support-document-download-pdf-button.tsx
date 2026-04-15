"use client";

import type { VariantProps } from "class-variance-authority";
import { DownloadIcon } from "lucide-react";
import { Button, type buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useDownloadSupportDocumentPdf } from "@/hooks/api/use-download-support-document-pdf";

interface SupportDocumentDownloadPdfButtonProps {
  documentId: string;
  documentNumber: string;
  label?: string;
  size?: VariantProps<typeof buttonVariants>["size"];
  variant?: VariantProps<typeof buttonVariants>["variant"];
}

export function SupportDocumentDownloadPdfButton({
  documentId,
  documentNumber,
  label = "Descargar PDF",
  size = "lg",
  variant = "default-subtle",
}: SupportDocumentDownloadPdfButtonProps) {
  const { downloadPdf, isPending } = useDownloadSupportDocumentPdf();

  return (
    <Button
      size={size}
      variant={variant}
      disabled={isPending}
      onClick={() => downloadPdf({ documentId, documentNumber })}
    >
      {isPending ? <Spinner /> : <DownloadIcon />}
      {label}
    </Button>
  );
}
