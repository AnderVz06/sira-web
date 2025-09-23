import api from "@/service/apiClient";
import { ENDPOINTS } from "../endpoints";

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string; // "bearer"
  username: string;
  role_id: number;
}

export interface MeResponse {
  full_name: string;
  id: number;
  enabled: boolean;
  area: string;
  hashed_password?: string;
  username: string;
  email: string;
  role_id: number;
  ultimo_accesso: string;
}

/** POST /auth/login */
export default async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>(ENDPOINTS.auth.login, payload);

  // Guarda sesión
  localStorage.setItem("auth_token", data.access_token);
  localStorage.setItem("auth_token_type", data.token_type);
  localStorage.setItem("auth_username", data.username);
  localStorage.setItem("auth_role_id", String(data.role_id));

  return data;
}

export async function getMe(): Promise<MeResponse> {
  const { data } = await api.get<MeResponse>(ENDPOINTS.auth.me);
  return data;
}
