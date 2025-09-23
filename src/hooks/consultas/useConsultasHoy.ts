import { useEffect, useState, useCallback } from "react";
import { getConsultasHoy, getConsultasHoyMedico } from "@/service/consultation/consultation";
import type { Consulta } from "@/types/consultation";
import type { ConsultaUI, Status } from "@/types/consultation";

export function useConsultasHoy(scope: "all" | "medico" = "all") {
  const [items, setItems] = useState<ConsultaUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const raw: Consulta[] =
        scope === "medico" ? await getConsultasHoyMedico() : await getConsultasHoy();
      setItems(raw.map(toUI));
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || "No se pudieron cargar las consultas");
    } finally {
      setLoading(false);
    }
  }, [scope]);

  useEffect(() => { load(); }, [load]);

  return { items, loading, error, reload: load };
}

function toUI(it: Consulta): ConsultaUI {
  const nombre = (it.paciente_nombre ?? (it as any).nombre ?? "").trim();
  // usa paciente_apelido (tal como llega), con fallback por si lo corrigen a paciente_apellido
  const apellido = ((it as any).paciente_apelido ?? (it as any).paciente_apellido ?? (it as any).apellido ?? "").trim();
  const hce = (it.paciente_hce ?? (it as any).hce ?? "").trim();
  const dni = (it.dni ?? "").trim();

  const llegada = it.created_at ?? ""; // si tu API trae llegada explícita, úsala aquí
  const cita = buildCitaIso(it.anio, it.mes, it.dia, it.hora, it.minuto) ?? llegada ?? "";

  const estado = (it.status as Status) ?? "En espera";
  const id = Number(it.id ?? 0) || Math.floor(Math.random() * 1e9);

  return {
    id,
    nombre,
    apellido,
    hce,
    dni,
    estado,
    llegada,
    cita,
    medico: it.user_fullname_medic,
  };
}

function pad2(n: number) { return String(n).padStart(2, "0"); }
/** Construye ISO tipo 2025-09-13T16:30:00 a partir de (anio, mes, dia, hora, minuto) */
function buildCitaIso(
  anio?: number, mes?: number, dia?: number, hora?: number, minuto?: number
): string | undefined {
  if (
    typeof anio !== "number" || typeof mes !== "number" || typeof dia !== "number" ||
    typeof hora !== "number" || typeof minuto !== "number"
  ) return undefined;
  // En tu ejemplo: mes=9 -> septiembre, así que asumimos 1..12 (no 0..11)
  return `${anio}-${pad2(mes)}-${pad2(dia)}T${pad2(hora)}:${pad2(minuto)}:00`;
}
