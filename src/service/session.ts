export type SessionData = {
  access_token: string;
  token_type: string; // "bearer"
  username: string;
  role_id: number;
};

export function saveSession(data: SessionData) {
  clearSession(); // limpiar antes de guardar
  localStorage.setItem("auth_token", data.access_token);
  localStorage.setItem("auth_token_type", data.token_type);
  localStorage.setItem("auth_username", data.username);
  localStorage.setItem("auth_role_id", String(data.role_id));
}

export function clearSession() {
  // por si hay restos en sessionStorage de versiones previas
  for (const s of [localStorage, sessionStorage]) {
    s.removeItem("auth_token");
    s.removeItem("auth_token_type");
    s.removeItem("auth_username");
    s.removeItem("auth_role_id");
  }
}

export function getToken(): string | null {
  return localStorage.getItem("auth_token");
}

export function getTokenType(): string {
  return localStorage.getItem("auth_token_type") ?? "Bearer";
}

export function getUsername(): string | null {
  return localStorage.getItem("auth_username");
}

export function getRoleId(): number | null {
  const v = localStorage.getItem("auth_role_id");
  return v ? Number(v) : null;
}

export function isAuthenticated(): boolean {
  const t = getToken();
  return !!t && t.trim().length > 0;
}