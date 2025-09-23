import api from "@/service/apiClient";
import type { VitalSign, VitalSignPayload } from "@/types/vitalsign";

/** Chequeo local: role_id = 3 (enfermero). La seguridad real va en el backend. */
const NURSE_ROLE_ID = 3;

function ensureNurse() {
  const raw = localStorage.getItem("auth_role_id");
  const roleId = raw ? Number(raw) : NaN;
  if (roleId !== NURSE_ROLE_ID) {
    const err = new Error("No autorizado: se requiere role_id = 3 (enfermero).");
    (err as any).code = "ERR_FORBIDDEN";
    (err as any).status = 403;
    throw err;
  }
}

/** POST /api/v1/vitalsign/ */
export async function createVitalSign(payload: VitalSignPayload): Promise<VitalSign> {
  ensureNurse();
  const { data } = await api.post<VitalSign>("/vitalsign/", payload);
  return data;
}

/** GET /api/v1/vitalsign/{id} */
export async function getVitalSignById(id: number): Promise<VitalSign> {
  ensureNurse();
  const { data } = await api.get<VitalSign>(`/vitalsign/${id}`);
  return data;
}

/** PUT /api/v1/vitalsign/{id} */
export async function updateVitalSign(id: number, payload: VitalSignPayload): Promise<VitalSign> {
  ensureNurse();
  const { data } = await api.put<VitalSign>(`/vitalsign/${id}`, payload);
  return data;
}

/** DELETE /api/v1/vitalsign/{id} */
export async function deleteVitalSignById(id: number): Promise<void> {
  ensureNurse();
  await api.delete(`/vitalsign/${id}`);
}

/** GET /api/v1/vitalsign/dni/{dni} */
export async function getVitalSignsByDni(dni: string): Promise<VitalSign[]> {
  ensureNurse();
  const { data } = await api.get<VitalSign[]>(`/vitalsign/dni/${encodeURIComponent(dni)}`);
  return data;
}

/** DELETE /api/v1/vitalsign/dni/{dni} */
export async function deleteVitalSignsByDni(dni: string): Promise<void> {
  ensureNurse();
  await api.delete(`/vitalsign/dni/${encodeURIComponent(dni)}`);
}

/** GET /api/v1/vitalsign/ultimo/{dni} */
export async function getLastVitalSignByDni(dni: string): Promise<VitalSign> {
  const { data } = await api.get<VitalSign>(`/vitalsign/ultimo/${encodeURIComponent(dni)}`);
  return data;
}

/** GET /api/v1/vitalsign/by-paciente/{paciente_hce} */
export async function getVitalSignsByPacienteHce(paciente_hce: string): Promise<VitalSign[]> {
  ensureNurse();
  const { data } = await api.get<VitalSign[]>(
    `/vitalsign/by-paciente/${encodeURIComponent(paciente_hce)}`
  );
  return data;
}
