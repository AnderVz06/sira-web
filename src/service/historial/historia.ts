// src/service/historial/historia.ts
import api from "@/service/apiClient";
import { ENDPOINTS } from "../endpoints";
import type { HistorialItem } from "@/types/history";

/**
 * Siempre devuelve un array:
 * - [] si 404 o sin datos
 * - [obj] si backend devuelve un único objeto
 * - [obj, obj, ...] si backend devuelve arreglo
 */
export default async function getHistorialByDni(
  dni: string,
  opts?: { signal?: AbortSignal }
): Promise<HistorialItem[]> {
  const url = ENDPOINTS.historial.byDni(dni);
  try {
    const { data } = await api.get<unknown>(url, { signal: opts?.signal });
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object") return [data as HistorialItem];
    return [];
  } catch (e: any) {
    if (
      e?.code === "ERR_CANCELED" ||
      e?.name === "CanceledError" ||
      e?.name === "AbortError"
    ) {
      throw e; // el hook lo ignora
    }
    if (e?.response?.status === 404) return [];
    throw e;
  }
}
