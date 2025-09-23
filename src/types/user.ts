export type RoleId = 1 | 2 | 3;

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  hashed_password: string;
  enabled: boolean;
  role_id: number;
  area: string;
  ultimo_accesso: string; // ISO
}

export interface UpdateUserPayload {
  full_name: string;
  email: string;
}

export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
}

export interface UserMedico {
  full_name: string;
}