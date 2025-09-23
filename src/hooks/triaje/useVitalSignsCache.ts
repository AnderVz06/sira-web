// src/hooks/triaje/useVitalSignsCache.ts
import { useEffect, useRef, useState } from "react";
import type { VitalSignUI } from "@/types/triaje";
import { getLastVitalSignByDni } from "@/service/vitalsign/vitalsign"; // <- importa del index

type MapByDni = Record<string, VitalSignUI | undefined>;

export function useVitalSignsCache(dnis: string[]) {
  const [lastByDni, setLastByDni] = useState<MapByDni>({});
  const loadingRef = useRef<Set<string>>(new Set());

  const fetchOne = async (dni: string) => {
    if (!dni || loadingRef.current.has(dni)) return;
    loadingRef.current.add(dni);
    try {
      const res = await getLastVitalSignByDni(dni); // puede ser null
      if (!res) {
        setLastByDni((m) => ({ ...m, [dni]: undefined }));
        return;
      }
      const ui: VitalSignUI = {
        id: res.id,
        fecha_registro: res.fecha_registro ?? null, // <- usar el campo correcto
        temperatura: res.temperatura,
        f_card: res.f_card,
        f_resp: res.f_resp,
        talla: res.talla,
        peso: res.peso,
      };
      setLastByDni((m) => ({ ...m, [dni]: ui }));
    } finally {
      loadingRef.current.delete(dni);
    }
  };

  useEffect(() => {
    (async () => {
      const unique = Array.from(new Set(dnis.filter(Boolean)));
      await Promise.all(unique.map(fetchOne));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify([...dnis].sort())]);

  const refresh = async (dni: string) => { await fetchOne(dni); };

  return { lastByDni, refresh };
}
