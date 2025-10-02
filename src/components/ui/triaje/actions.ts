import type { PacientePayload } from "@/types/patient";
import { createPaciente } from "@/service/pacientes/pacientes";
import type { VitalSignPayload } from "@/types/vitalsign";
import { createVitalSign, getVitalSignsByDni } from "@/service/vitalsign/vitalsign";
import type { VitalSignUI } from "@/types/triaje";

export async function createPacienteUI(payload: PacientePayload) {
  return await createPaciente(payload);
}

export async function createVitalSignUI(payload: VitalSignPayload) {
  return await createVitalSign(payload);
}

export async function getVitalListUIByDni(dni: string): Promise<VitalSignUI[]> {
  const list = await getVitalSignsByDni(dni);
  return list
    .map((r) => ({
      id: r.id,
      fecha: r.created_at ?? null,
      temperatura: r.temperatura,
      f_card: r.f_card,
      f_resp: r.f_resp,
      talla: r.talla,
      peso: r.peso,
    }))
    .sort((a, b) => (a.fecha || "").localeCompare(b.fecha || ""));
}
