// Solo los que pueden solicitar cuenta
export type AccessRoleId = 2 | 3; // 2 = Enfermero, 3 = Médico

export type AccessRoleCode = "enfermero" | "medico";

export const ROLE_ID_TO_CODE: Record<AccessRoleId, AccessRoleCode> = {
  2: "medico",
  3: "enfermero",
};
