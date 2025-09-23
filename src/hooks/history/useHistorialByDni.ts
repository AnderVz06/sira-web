import { useEffect, useMemo, useState } from "react";
import getHistorialByDni from "@/service/historial/historia";
import type { HistorialItem } from "@/types/history";

const isCanceled = (e: unknown) =>
  !!(
    e &&
    typeof e === "object" &&
    (((e as any).name === "CanceledError") ||
      (e as any).name === "AbortError" ||
      (e as any).code === "ERR_CANCELED" ||
      (e as any).message === "canceled")
  );

export function useHistorialByDni(dni?: string) {
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(dni));
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0); // para forzar refetch

  useEffect(() => {
    let alive = true;
    const ac = new AbortController();

    if (!dni) {
      setHistorial([]); setLoading(false); setError(null);
      return () => { alive = false; ac.abort(); };
    }

    setLoading(true); setError(null);
    (async () => {
      try {
        const data = await getHistorialByDni(dni, { signal: ac.signal }); // HistorialItem[]
        if (!alive) return;
        const sorted = [...(data ?? [])].sort(
          (a, b) => new Date(b.fecha_registro).getTime() - new Date(a.fecha_registro).getTime()
        );
        setHistorial(sorted);
      } catch (e) {
        if (!alive || isCanceled(e)) return;
        setError(e instanceof Error ? e.message : "Error al cargar el historial");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => { alive = false; ac.abort(); };
  }, [dni, nonce]);

  const reload = () => setNonce((n) => n + 1);

  // Header del paciente (del primer item; si no hay, usa DNI)
  const pacienteHeader = useMemo(() => {
    const primero = historial[0];
    if (primero) {
      const full = (primero.paciente_nombre ?? "").trim();
      const parts = full ? full.split(/\s+/) : [];
      return {
        dni: primero.paciente_dni,
        nombre: parts[0] || "Paciente",
        apellido: parts.slice(1).join(" ") || "",
      };
    }
    return dni ? { dni, nombre: "Paciente", apellido: "" } : null;
  }, [historial, dni]);

  return { historial, pacienteHeader, loading, error, reload };
}

export default useHistorialByDni;
