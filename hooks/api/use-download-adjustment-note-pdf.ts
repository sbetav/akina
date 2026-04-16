"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "@/components/ui/toast";
import { api } from "@/elysia/eden";
import { getApiErrorMessage } from "@/elysia/get-api-error-message";

interface DownloadAdjustmentNotePdfInput {
  adjustmentNoteId: string;
  adjustmentNoteNumber: string;
}

function sanitizeFileName(fileName: string): string {
  return Array.from(fileName, (char) => {
    const code = char.charCodeAt(0);
    if (code < 32) return "-";
    return '<>:"/\\|?*'.includes(char) ? "-" : char;
  })
    .join("")
    .trim();
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const raw = base64.includes(",") ? (base64.split(",").at(-1) ?? "") : base64;
  const normalized = raw.replace(/-/g, "+").replace(/_/g, "/");
  const padded =
    normalized.length % 4 === 0
      ? normalized
      : normalized + "=".repeat(4 - (normalized.length % 4));

  const binary = window.atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes.buffer;
}

export function useDownloadAdjustmentNotePdf() {
  const mutation = useMutation({
    mutationFn: async ({
      adjustmentNoteId,
      adjustmentNoteNumber,
    }: DownloadAdjustmentNotePdfInput) => {
      const res = await api["adjustment-notes"]({
        id: adjustmentNoteId,
      }).pdf.get();

      if (res.error) {
        throw new Error(
          getApiErrorMessage(res.error, "Error al descargar el PDF"),
        );
      }

      return { ...res.data, adjustmentNoteNumber };
    },
    onSuccess: ({ fileName, pdfBase64, adjustmentNoteNumber }) => {
      const buffer = base64ToArrayBuffer(pdfBase64);
      const blob = new Blob([buffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download =
        sanitizeFileName(
          fileName?.trim() || `nota-ajuste-${adjustmentNoteNumber}.pdf`,
        ) || `nota-ajuste-${adjustmentNoteNumber}.pdf`;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();

      setTimeout(() => URL.revokeObjectURL(url), 0);

      toast.success("PDF descargado correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    downloadPdf: mutation.mutate,
    downloadPdfAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
}
