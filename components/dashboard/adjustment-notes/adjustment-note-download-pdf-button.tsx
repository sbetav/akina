"use client";

import type { VariantProps } from "class-variance-authority";
import { DownloadIcon } from "lucide-react";
import { Button, type buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useDownloadAdjustmentNotePdf } from "@/hooks/api/use-download-adjustment-note-pdf";

interface AdjustmentNoteDownloadPdfButtonProps {
  adjustmentNoteId: string;
  adjustmentNoteNumber: string;
  label?: string;
  size?: VariantProps<typeof buttonVariants>["size"];
  variant?: VariantProps<typeof buttonVariants>["variant"];
}

export function AdjustmentNoteDownloadPdfButton({
  adjustmentNoteId,
  adjustmentNoteNumber,
  label = "PDF",
  size = "sm",
  variant = "default-subtle",
}: AdjustmentNoteDownloadPdfButtonProps) {
  const { downloadPdf, isPending } = useDownloadAdjustmentNotePdf();

  return (
    <Button
      size={size}
      variant={variant}
      disabled={isPending}
      onClick={() => downloadPdf({ adjustmentNoteId, adjustmentNoteNumber })}
    >
      {isPending ? <Spinner /> : <DownloadIcon />}
      {label}
    </Button>
  );
}
