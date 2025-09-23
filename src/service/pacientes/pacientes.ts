import api from "@/service/apiClient";
import { ENDPOINTS } from "@/service/endpoints";
import type { PacientePayload, Paciente } from "@/types/patient";

/** GET /api/v1/pacientes/ */
export async function listPacientes(): Promise<Paciente[]> {
  const { data } = await api.get<Paciente[]>(ENDPOINTS.pacientes.list);
  return data;
}

/** POST /api/v1/pacientes/ */
export async function createPaciente(payload: PacientePayload): Promise<Paciente> {
  const { data } = await api.post<Paciente>(ENDPOINTS.pacientes.create, payload);
  return data;
}

/**
 * GET /api/v1/pacientes/buscar
 * Puedes pasar uno o varios params: { nombre?, dni?, hce? }
 */
export async function searchPacientes(params: {
  nombre?: string;
  dni?: string;
  hce?: string;
}): Promise<Paciente[]> {
  const { data } = await api.get<Paciente[]>(ENDPOINTS.pacientes.search, { params });
  return data;
}

/** GET /api/v1/pacientes/{paciente_hce} */
export async function getPacienteByHce(hce: string): Promise<Paciente> {
  const { data } = await api.get<Paciente>(ENDPOINTS.pacientes.byHce(hce));
  return data;
}

/** PUT /api/v1/pacientes/{paciente_hce} */
export async function updatePacienteByHce(
  hce: string,
  payload: PacientePayload
): Promise<Paciente> {
  const { data } = await api.put<Paciente>(ENDPOINTS.pacientes.byHce(hce), payload);
  return data;
}

/** DELETE /api/v1/pacientes/{paciente_hce} */
export async function deletePacienteByHce(hce: string): Promise<void> {
  await api.delete(ENDPOINTS.pacientes.byHce(hce));
}

/** GET /api/v1/pacientes/by-dni/{dni} */
export async function getPacienteByDni(dni: string): Promise<Paciente> {
  const { data } = await api.get<Paciente>(ENDPOINTS.pacientes.byDni(dni));
  return data;
}

/** PUT /api/v1/pacientes/by-dni/{dni} */
export async function updatePacienteByDni(
  dni: string,
  payload: PacientePayload
): Promise<Paciente> {
  const { data } = await api.put<Paciente>(ENDPOINTS.pacientes.byDni(dni), payload);
  return data;
}

/** DELETE /api/v1/pacientes/by-dni/{dni} */
export async function deletePacienteByDni(dni: string): Promise<void> {
  await api.delete(ENDPOINTS.pacientes.byDni(dni));
}
