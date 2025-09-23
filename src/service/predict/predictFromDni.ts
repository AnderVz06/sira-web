import api from "@/service/apiClient";
import { ENDPOINTS } from "@/service/endpoints";

export interface PredictRequest {
  motivo_consulta: string;
  examenfisico: string;
  indicaciones: string;
  medicamentos: string;
  notas: string;
}

// Define el tipo si conoces la respuesta real de tu backend.
// Por ahora usamos unknown.
export type PredictResponse = unknown;

export default async function predictFromDni(
  dni: string,
  payload: PredictRequest,
  opts?: { signal?: AbortSignal; consultaId?: number }
): Promise<PredictResponse> {
  if (!Number.isFinite(opts?.consultaId)) {
    throw new Error("consulta_id es requerido y debe ser numérico");
  }
  const url = ENDPOINTS.predict.fromDni(dni);
  const { data } = await api.post<PredictResponse>(url, payload, {
    signal: opts?.signal,
    params: { consulta_id: opts!.consultaId }, // <- query param
  });
  return data;
}
