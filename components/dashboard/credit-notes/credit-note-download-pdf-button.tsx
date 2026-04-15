"use client";

import type { VariantProps } from "class-variance-authority";
import { DownloadIcon } from "lucide-react";
import { Button, type buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useDownloadCreditNotePdf } from "@/hooks/api/use-download-credit-note-pdf";

interface CreditNoteDownloadPdfButtonProps {
  creditNoteId: string;
  creditNoteNumber: string;
  label?: string;
  size?: VariantProps<typeof buttonVariants>["size"];
  variant?: VariantProps<typeof buttonVariants>["variant"];
}

export function CreditNoteDownloadPdfButton({
  creditNoteId,
  creditNoteNumber,
  label = "PDF",
  size = "sm",
  variant = "default-subtle",
}: CreditNoteDownloadPdfButtonProps) {
  const { downloadPdf, isPending } = useDownloadCreditNotePdf();

  return (
    <Button
      size={size}
      variant={variant}
      disabled={isPending}
      onClick={() => downloadPdf({ creditNoteId, creditNoteNumber })}
    >
      {isPending ? <Spinner /> : <DownloadIcon />}
      {label}
    </Button>
  );
}
