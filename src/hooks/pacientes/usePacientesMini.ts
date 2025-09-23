// src/hooks/pacientes/usePacientesMini.ts
import { useEffect, useMemo, useRef, useState } from "react";
import { listPacientes, searchPacientes } from "@/service/pacientes/pacientes";
import type { Paciente } from "@/types/patient";

export type PacienteMini = { dni: string; full_name: string };

function toMini(p: Paciente): PacienteMini {
  const full_name = `${(p.nombre ?? "").trim()} ${(p.apellido ?? "").trim()}`.trim();
  return { dni: String(p.dni ?? "").trim(), full_name };
}

export function usePacientesMini(params: { page: number; size: number; search?: string }) {
  const { page, size, search = "" } = params;

  const [data, setData] = useState<PacienteMini[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const timerRef = useRef<number | null>(null);

  // 1) Carga base
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const base = await listPacientes();
        if (!alive) return;
        setData((base ?? []).map(toMini));
      } catch (e: any) {
        if (!alive) return;
        setError(e?.response?.data?.detail || e?.message || "No se pudo cargar pacientes");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // 2) Búsqueda server-side SOLO por DNI (debounced)
  useEffect(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const raw = search.trim();
    const q = raw.replace(/\D+/g, ""); // ← SOLO dígitos

    if (!q) {
      // si limpian o no hay dígitos, recarga base (con debounce suave)
      timerRef.current = window.setTimeout(async () => {
        try {
          const base = await listPacientes();
          setData((base ?? []).map(toMini));
        } catch {/* ignore */}
      }, 200);
      return;
    }

    let alive = true;
    timerRef.current = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const res = await searchPacientes({ dni: q }); // ← SOLO dni
        if (!alive) return;
        setData((res ?? []).map(toMini));
      } catch (e: any) {
        if (!alive) return;
        setError(e?.response?.data?.detail || e?.message || "No se pudo buscar pacientes");
      } finally {
        if (alive) setLoading(false);
      }
    }, 250);

    return () => {
      alive = false;
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [search]);

  // 3) Filtro/orden SOLO por DNI en cliente
  const filtered = useMemo(() => {
    const q = search.trim().replace(/\D+/g, "").toLowerCase(); // solo dígitos
    if (!q) {
      // sin query: ordena por DNI numérico asc
      return [...data].sort((a, b) =>
        a.dni.localeCompare(b.dni, undefined, { numeric: true, sensitivity: "base" })
      );
    }

    const score = (dni: string): number => {
      const d = dni.toLowerCase();
      if (d.startsWith(q)) return 0; // prefijo primero
      if (d.includes(q))  return 1; // contiene después
      return 2;
    };

    return [...data]
      .filter(p => p.dni.toLowerCase().includes(q))
      .sort((a, b) => {
        const sa = score(a.dni), sb = score(b.dni);
        if (sa !== sb) return sa - sb;
        return a.dni.localeCompare(b.dni, undefined, { numeric: true, sensitivity: "base" });
      });
  }, [data, search]);

  // 4) paginación
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / size));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * size;
  const rows = filtered.slice(start, start + size);

  return { rows, totalItems, totalPages, loading, error };
}
