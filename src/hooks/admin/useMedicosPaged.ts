// src/hooks/admin/useMedicosPaged.ts
import { useEffect, useMemo, useState } from "react";
import { listMedicos } from "@/service/user/users";
import type { UserMedico } from "@/types/user";

function useDebouncedValue<T>(value: T, ms = 250): T {
  const [v, setV] = useState(value);
  useEffect(() => { const id = setTimeout(() => setV(value), ms); return () => clearTimeout(id); }, [value, ms]);
  return v;
}

/** Lista SOLO médicos desde /api/v1/users/medicos, con búsqueda y paginación en cliente */
export function useMedicosPaged(params: { page: number; size: number; search?: string }) {
  const { page, size, search } = params;
  const [all, setAll] = useState<UserMedico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const debounced = useDebouncedValue(search ?? "", 250);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    listMedicos()
      .then((rows) => { if (alive) setAll(rows); })
      .catch((e: any) => {
        if (!alive) return;
        setError(e?.response?.data?.detail || e?.message || "No se pudo obtener médicos");
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    // dedup por si vienen repetidos
    const uniq = Array.from(new Map(all.map(m => [m.full_name, m])).values());
    return uniq
      .filter(m => (q ? m.full_name.toLowerCase().includes(q) : true))
      .sort((a, b) => a.full_name.localeCompare(b.full_name));
  }, [all, debounced]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / size));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * size;
  const pageRows = filtered.slice(start, start + size);

  // ← devolvemos SOLO strings
  const names = useMemo(() => pageRows.map(m => m.full_name), [pageRows]);

  return { names, totalItems, totalPages, loading, error };
}
