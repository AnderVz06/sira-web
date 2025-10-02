// src/service/consultation/getConsultaActivaHoy.ts
import { getRoleId } from "@/service/session";
import { getConsultasHoy, getConsultasHoyMedico } from "@/service/consultation/consultation";
import type { Consulta } from "@/types/consultation";

export type ConsultaActiva = {
  id: number;
  estado: string;
  fecha: string; // ISO (cita o created_at)
  dni: string;
};

function pad2(n: number) { return String(n).padStart(2, "0"); }
function buildCitaIso(
  anio?: number, mes?: number, dia?: number, hora?: number, minuto?: number
): string | undefined {
  if (
    typeof anio !== "number" || typeof mes !== "number" || typeof dia !== "number" ||
    typeof hora !== "number" || typeof minuto !== "number"
  ) return undefined;
  return `${anio}-${pad2(mes)}-${pad2(dia)}T${pad2(hora)}:${pad2(minuto)}:00`;
}

function isTodayISO(iso?: string): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return false;
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export async function getConsultaActivaHoy(dni: string): Promise<ConsultaActiva | null> {
  const roleId = getRoleId();
  // Si es médico (2), usa el endpoint “hoy/medico”, si no, el general de hoy:
  const raw: Consulta[] = roleId === 2 ? await getConsultasHoyMedico() : await getConsultasHoy();

  // Construye ISO de cita cuando venga separada (anio, mes, dia, hora, minuto)
  const withIso = raw.map((it) => {
    const cita = buildCitaIso(it.anio as any, it.mes as any, it.dia as any, it.hora as any, it.minuto as any)
      ?? (it.created_at || "");
    return { ...it, _citaIso: cita };
  });

  // Filtra por DNI, por HOY y por estado no finalizado/cancelado
  const candidatos = withIso.filter((it) => {
    const dniIt = (it.dni ?? "").trim();
    const estado = String(it.status ?? "").trim();
    const activo = estado !== "Terminado" && estado !== "Cancelado";
    return dniIt === dni && activo && isTodayISO((it as any)._citaIso);
  });

  if (candidatos.length === 0) return null;

  // Priorización: En proceso > En espera, y luego por hora más cercana
  const pesoEstado = (estado: string) =>
    estado === "En proceso" ? 0 : estado === "En espera" ? 1 : 2;

  candidatos.sort((a, b) => {
    const pa = pesoEstado(String(a.status ?? ""));
    const pb = pesoEstado(String(b.status ?? ""));
    if (pa !== pb) return pa - pb;
    const ta = new Date((a as any)._citaIso).getTime();
    const tb = new Date((b as any)._citaIso).getTime();
    return ta - tb;
  });

  const pick = candidatos[0];
  return {
    id: Number(pick.id),
    estado: String(pick.status ?? ""),
    fecha: (pick as any)._citaIso,
    dni: (pick.dni ?? "").trim(),
  };
}
