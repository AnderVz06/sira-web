// src/service/httpErrors.ts
export function isAuthzErrorMessage(msg?: string) {
  if (!msg) return false;
  return /no autorizado|rol no permitido|forbidden/i.test(msg);
}
