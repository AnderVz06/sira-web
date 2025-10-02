// src/constants/roles.ts
export const ROLE_ADMIN = 1;
export const ROLE_MEDICO = 2;
export const ROLE_ENFERMERO = 3;

export function getLandingRoute(roleId: number | null | undefined): string {
  switch (Number(roleId) || 0) {
    case ROLE_ADMIN: return "/registro-personal";
    case ROLE_MEDICO: return "/consultas-medico";
    case ROLE_ENFERMERO: return "/triaje";
    default: return "/";
  }
}
