import { useEffect, useMemo, useState } from "react";
import type { Genero, PacienteUI } from "@/types/triaje";
import { listPacientes, searchPacientes } from "@/service/pacientes/pacientes";
import type { Paciente } from "@/types/patient";

function toUI(p: Paciente): PacienteUI {
  // asume que genero llega como "m" | "f" (si no, normaliza)
  const gen = (p.genero || "").toLowerCase();
  return {
    dni: p.dni,
    nombre: p.nombre,
    apellido: p.apellido,
    edad: p.edad,
    genero: gen === "m" || gen === "masculino" ? "m" : "f",
    paciente_hce: p.paciente_hce ?? undefined,
  };
}

export function usePacientesPaged(params: {
  page: number;
  size: number;
  search?: string;
  genero: Genero | "todos";
}) {
  const { page, size, search, genero } = params;

  const [all, setAll] = useState<PacienteUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = search
        ? await searchPacientes({ nombre: search, dni: search, hce: search })
        : await listPacientes();
      setAll(data.map(toUI));
    } catch (e: any) {
      const msg = e?.response?.data?.detail || e?.message || "No se pudo cargar pacientes";
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* on mount */ }, []);
  useEffect(() => { if (search !== undefined) load(); }, [search]);

  const filtered = useMemo(() => {
    const gOk = (p: PacienteUI) => (genero === "todos" ? true : p.genero === genero);
    return all.filter(gOk).sort((a, b) =>
      `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`)
    );
  }, [all, genero]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / size));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * size;
  const rows = filtered.slice(start, start + size);

  const reload = async () => { await load(); };

  return { rows, totalItems, totalPages, loading, error, reload };
}
