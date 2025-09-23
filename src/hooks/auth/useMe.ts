// src/hooks/auth/useMe.ts
import { useEffect, useState, useCallback } from "react";
import { getMe } from "@/service/auth/login";
import type { MeResponse } from "@/service/auth/login";

export function useMe() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMe();
      setMe(data);
    } catch (e: any) {
      setError(e?.message || "No se pudo cargar tu perfil.");
      setMe(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { me, loading, error, reload };
}
