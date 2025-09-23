import type { HistorialItem } from "@/types/history";
import type { Block } from "@/hooks/history/useBloques";

export function buildConsolidadoFromBloques(
  bloques: Block[],
  ultima?: HistorialItem
): Partial<HistorialItem> {
  const dx = bloques.find((b): b is Extract<Block, { type: "diagnostico" }> => b.type === "diagnostico");
  const rx = bloques.find((b): b is Extract<Block, { type: "receta" }> => b.type === "receta");
  const ind = bloques.find((b): b is Extract<Block, { type: "indicaciones" }> => b.type === "indicaciones");
  const nt = bloques.find((b): b is Extract<Block, { type: "notas" }> => b.type === "notas");

  const temperatura = dx?.payload.signos?.temperatura ?? ultima?.temperatura ?? 0;
  const f_card = dx?.payload.signos?.f_card ?? ultima?.f_card ?? 0;
  const f_resp = dx?.payload.signos?.f_resp ?? ultima?.f_resp ?? 0;
  const talla = dx?.payload.signos?.talla ?? ultima?.talla ?? 0;
  const peso = dx?.payload.signos?.peso ?? ultima?.peso ?? 0;

  const medsList =
    rx?.payload.medicamentos.map((m) => [m.nombre, m.dosis, m.frecuencia].filter(Boolean).join(" • ")) || [];

  // Unimos indicaciones de receta + indicaciones generales
  const indicParts: string[] = [];
  if (rx?.payload.indicaciones) indicParts.push(rx.payload.indicaciones);
  if (ind?.payload.indicaciones) indicParts.push(ind.payload.indicaciones);

  const notasParts: string[] = [];
  if (nt?.payload.notas?.trim()) notasParts.push(nt.payload.notas.trim());

  return {
    fecha_registro: new Date().toISOString(),
    temperatura,
    f_card,
    f_resp,
    talla,
    peso,
    motivo_consulta: dx?.payload.motivo || "—",
    examenfisico: dx?.payload.examen || "—",
    resultado_diagnostico: dx?.payload.diagnostico?.trim() || "Diagnóstico preliminar",
    indicaciones: indicParts.length ? indicParts.join("\n") : undefined,
    medicamentos: medsList.join(", "),
    notas: notasParts.length ? notasParts.join("\n") : undefined,
  };
}
