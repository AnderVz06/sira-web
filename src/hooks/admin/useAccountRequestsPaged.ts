import { useEffect, useMemo, useState } from "react";
import { getAccountRequests } from "@/service/access/accountRequests";
import type { AccountRequest } from "@/types/accountRequests";

export type RoleFilter = "todos" | "admin" | "medico" | "enfermero";

export function useAccountRequestsPaged(params: {
  page: number;
  size: number;
  search?: string;
  role?: RoleFilter; // "medico" | "enfermero" | undefined
  refreshKey?: number;
}) {
  const { page, size, search, role, refreshKey } = params;
  const [raw, setRaw] = useState<AccountRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    getAccountRequests()
      .then((data) => {
        if (!alive) return;
        setRaw(Array.isArray(data) ? data : []);
      })
      .catch((err: any) => {
        if (!alive) return;
        const msg =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          "No se pudo cargar las solicitudes";
        setError(String(msg));
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [refreshKey]);

  // Filtro en cliente
  const filtered = useMemo(() => {
    let rows = raw.slice();
    if (role && role !== "todos") {
      rows = rows.filter((r) => (r.requested_role || "").toLowerCase() === role);
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((r) =>
        (r.full_name?.toLowerCase() || "").includes(q) ||
        (r.email?.toLowerCase() || "").includes(q) ||
        (r.area?.toLowerCase() || "").includes(q) ||
        (r.motivo?.toLowerCase() || "").includes(q)
      );
    }
    // Ordenar por fecha si existe
    rows.sort((a, b) => {
      const da = a.created_at ? Date.parse(a.created_at) : 0;
      const db = b.created_at ? Date.parse(b.created_at) : 0;
      return db - da;
    });
    return rows;
  }, [raw, role, search]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / size));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * size;
  const end = start + size;
  const pageRows = filtered.slice(start, end);

  return {
    rows: pageRows,
    totalItems,
    totalPages,
    loading,
    error,
  };
}
