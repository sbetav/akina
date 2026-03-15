import { factusClient } from "./client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Municipality {
  id: number;
  code: string;
  name: string;
  department: string;
}

export interface Acquirer {
  name: string;
  email: string;
}

// ─── Internal response wrappers ───────────────────────────────────────────────

interface FactusListResponse<T> {
  status: string;
  message: string;
  data: T[];
}

interface FactusItemResponse<T> {
  status: string;
  message: string;
  data: T;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const factusApi = {
  municipalities: {
    async getAll(name?: string): Promise<Municipality[]> {
      const path = name
        ? `/v1/municipalities?name=${encodeURIComponent(name)}`
        : "/v1/municipalities";

      const res =
        await factusClient.get<FactusListResponse<Municipality>>(path);
      return res.data;
    },
  },

  acquirers: {
    async getByDocument(
      identificationDocumentId: string,
      identificationNumber: string,
    ): Promise<Acquirer> {
      const params = new URLSearchParams({
        identification_document_id: identificationDocumentId,
        identification_number: identificationNumber,
      });

      const res = await factusClient.get<FactusItemResponse<Acquirer>>(
        `/v1/dian/acquirer?${params}`,
      );
      return res.data;
    },
  },
};
