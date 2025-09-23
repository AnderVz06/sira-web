// src/utils/dates.ts
export function formatDateTime(isoOrNull: string | null): string {
  if (!isoOrNull) return "—";
  const d = new Date(isoOrNull);
  if (isNaN(d.getTime())) return isoOrNull; // por si viene en otro formato
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export const formatearFecha = (iso: string) =>
  new Date(iso)
    .toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })
    .replace(/\./g, "");

export const calcularAntiguedad = (iso: string) => {
  const fecha = new Date(iso);
  const ahora = new Date();
  const ms = ahora.getTime() - fecha.getTime();
  const dias = Math.floor(ms / (1000 * 60 * 60 * 24));
  if (dias < 1) return "Hoy";
  if (dias === 1) return "Hace 1 día";
  if (dias < 30) return `Hace ${dias} días`;
  const meses = Math.floor(dias / 30);
  if (meses === 1) return "Hace 1 mes";
  if (meses < 12) return `Hace ${meses} meses`;
  const años = Math.floor(meses / 12);
  return `Hace ${años} ${años === 1 ? "año" : "años"}`;
};