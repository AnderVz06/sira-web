// src/router/loaders/consultaActivaLoader.ts
import { LoaderFunctionArgs, redirect } from "react-router-dom";
import { getConsultaActivaHoy } from "@/hooks/consultas/getConsultaActivaHoy";

export async function consultaActivaLoader({ params, request }: LoaderFunctionArgs) {
    const dni = params.dni;
    if (!dni) return redirect("/consultas-medico");

    const url = new URL(request.url);
    const consultaIdStr = url.searchParams.get("consulta_id");
    const consultaId = consultaIdStr ? Number(consultaIdStr) : undefined;

    const activa = await getConsultaActivaHoy(dni);

    if (!activa) return redirect("/consultas-medico");
    if (["Terminado", "Cancelado"].includes(activa.estado)) return redirect("/consultas-medico");

    if (!Number.isFinite(consultaId) || Number(consultaId) !== Number(activa.id)) {
        return redirect(`/realizar-Consulta/${dni}?consulta_id=${activa.id}`);
    }

    return null;
}
