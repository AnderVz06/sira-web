// src/hooks/history/useUpdatePredictByDni.ts
import { useCallback, useState } from "react";
import api from "@/service/apiClient";
import { ENDPOINTS } from "@/service/endpoints";
import type { PredictRecord } from "./useLastPredictByDni";

export type UpdatePredictPayload = Pick<
  PredictRecord,
  "motivo_consulta" | "examenfisico" | "indicaciones" | "medicamentos" | "notas"
>;

export function useUpdatePredictByDni() {
  const [data, setData] = useState<PredictRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(async (dni: string, body: UpdatePredictPayload) => {
    setLoading(true);
    setError(null);
    try {
      const url = ENDPOINTS.predict.updatePredictByDni(dni);
      const { data } = await api.put<PredictRecord>(url, body);
      setData(data);
      return data;
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Error al actualizar la consulta";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, update } as const;
}
