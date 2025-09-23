import { useCallback, useEffect, useState } from "react";
import api from "@/service/apiClient";
import { ENDPOINTS } from "@/service/endpoints";


export interface PredictRecord {
    id: number;
    consulta_id: number;
    dni: string;
    temperatura: number;
    edad: number;
    f_card: number;
    f_resp: number;
    talla: number;
    peso: number;
    genero: string;
    motivo_consulta: string;
    examenfisico: string;
    indicaciones: string;
    medicamentos: string;
    notas: string;
    resultado: string;
    imc: number;
}

export function useLastPredictByDni(dni?: string) {
    const [data, setData] = useState<PredictRecord | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    const fetchLast = useCallback(async () => {
        if (!dni) return;
        setLoading(true);
        setError(null);
        try {
            const url = ENDPOINTS.predict.lastPredictByDni(dni);
            const { data } = await api.get<PredictRecord>(url);
            setData(data);
        } catch (e: any) {
            setError(e?.message || "Error al cargar la historia clínica");
        } finally {
            setLoading(false);
        }
    }, [dni]);


    useEffect(() => {
        void fetchLast();
    }, [fetchLast]);


    return { data, loading, error, reload: fetchLast } as const;
}