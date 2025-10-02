// src/service/consultas/index.ts
import api from "@/service/apiClient";
import { ENDPOINTS } from "@/service/endpoints";
import type { ConsultaPayload, Consulta } from "@/types/consultation";

/** Roles */
const ROLE_ADMIN = 1;
const ROLE_MEDICO = 2;
const ROLE_ENFERMERO = 3;

function currentRoleId(): number | undefined {
  const raw = localStorage.getItem("auth_role_id");
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) ? n : undefined;
}

function ensureRole(allowed: number[]) {
  const role = currentRoleId();
  if (!role || !allowed.includes(role)) {
    const err = new Error("No autorizado: rol no permitido para esta operación.");
    (err as any).code = "ERR_FORBIDDEN";
    (err as any).status = 403;
    throw err;
  }
}

/** POST /api/v1/consultas/  (roles: admin=1, enfermero=3) */
export async function createConsulta(payload: ConsultaPayload): Promise<Consulta> {
  ensureRole([ROLE_ADMIN, ROLE_ENFERMERO]);
  const { data } = await api.post<Consulta>(ENDPOINTS.consultas.create, payload);
  return data;
}

/** GET /api/v1/consultas/paciente/{dni}  (roles: 1,3) */
export async function getConsultasByPaciente(dni: string): Promise<Consulta[]> {
  ensureRole([ROLE_ADMIN, ROLE_ENFERMERO]);
  const { data } = await api.get<Consulta[]>(ENDPOINTS.consultas.byPaciente(dni));
  return data;
}

/** GET /api/v1/consultas/medico/{user_fullname}  (roles: 1,3) */
export async function getConsultasByMedico(user_fullname: string): Promise<Consulta[]> {
  ensureRole([ROLE_ADMIN, ROLE_ENFERMERO]);
  const { data } = await api.get<Consulta[]>(
    ENDPOINTS.consultas.byMedico(encodeURIComponent(user_fullname))
  );
  return data;
}

/** PATCH /api/v1/consultas/{consulta_dni}/status  (roles: 1,3) */
export async function patchConsultaStatus(
  consulta_dni: string,
  status: string
): Promise<{ message?: string } | Consulta> {
  ensureRole([ROLE_ADMIN, ROLE_ENFERMERO]);
  const { data } = await api.patch(ENDPOINTS.consultas.patchStatus(consulta_dni), { status });
  return data;
}

/** GET /api/v1/consultas/hoy  (roles: 1,3)
 * Si tu backend acepta parámetro de búsqueda, usa `q` (ajusta si fuese otro nombre).
 */
export async function getConsultasHoy(q?: string): Promise<Consulta[]> {
  ensureRole([ROLE_ADMIN, ROLE_ENFERMERO]);
  const params = q ? { q } : undefined;
  const { data } = await api.get<Consulta[]>(ENDPOINTS.consultas.hoy, { params });
  return data;
}

/** GET /api/v1/consultas/hoy/medico  (solo médico=2) */
export async function getConsultasHoyMedico(q?: string): Promise<Consulta[]> {
  ensureRole([ROLE_MEDICO]);
  const params = q ? { q } : undefined;
  const { data } = await api.get<Consulta[]>(ENDPOINTS.consultas.hoyMedico, { params });
  return data;
}

/** GET /api/v1/consultas/total/medico  (solo médico=2) */
export async function getConsultasTotalMedico(): Promise<number | { total: number } | any> {
  ensureRole([ROLE_MEDICO]);
  const { data } = await api.get(ENDPOINTS.consultas.totalMedico);
  return data;
}

/** GET /api/v1/consultas/total/medico/ultimos7dias  (solo médico=2) */
export async function getConsultasTotalMedicoUltimos7Dias(): Promise<
  Array<{ date?: string; total?: number }> | any
> {
  ensureRole([ROLE_MEDICO]);
  const { data } = await api.get(ENDPOINTS.consultas.totalMedicoUltimos7Dias);
  return data;
}


export async function setConsultaEditStatus(
  consulta_id: number,
  editStatus: boolean
): Promise<Consulta> {
  ensureRole([ROLE_ADMIN, ROLE_MEDICO]);
  const { data } = await api.patch<Consulta>(
    ENDPOINTS.consultas.updateEditConsutation(consulta_id),
    { edit_status: editStatus }
  );
  return data;
}