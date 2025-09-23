import { useEffect, useMemo, useState } from "react";
import type { User } from "@/types/user";
import listUsers from "@/service/user/users";

type FilterRole = "admin" | "medico" | "enfermero";
const roleToId: Record<FilterRole, 1 | 2 | 3> = { admin: 1, enfermero: 2, medico: 3 };

export function useUsersPaged(params: {
  page: number;
  size: number;
  search?: string;
  role?: "todos" | FilterRole;
}) {
  const { page, size, search, role } = params;

  const [all, setAll] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    listUsers()
      .then((rows) => { if (alive) setAll(rows); })
      .catch((e: any) => {
        if (!alive) return;
        const msg = e?.response?.data?.detail || e?.message || "No se pudo obtener usuarios";
        setError(String(msg));
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    const roleId = role && role !== "todos" ? roleToId[role] : undefined;
    return all
      .filter(u => (roleId ? u.role_id === roleId : true))
      .filter(u => {
        if (!q) return true;
        const haystack = `${u.full_name} ${u.username} ${u.email}`.toLowerCase();
        return haystack.includes(q);
      })
      .sort((a, b) => a.full_name.localeCompare(b.full_name));
  }, [all, search, role]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / size));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * size;
  const rows = filtered.slice(start, start + size);

  return { rows, totalItems, totalPages, loading, error };
}
