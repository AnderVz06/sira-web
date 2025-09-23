export interface AccountRequest {
  id: number;
  full_name: string;
  email: string;
  requested_role: string;
  area: string;
  motivo: string;
  status?: string;
  created_at?: string;
}

export interface CreateAccountRequestPayload {
  full_name: string;
  email: string;
  requested_role: string;
  area: string;
  motivo: string;
}

export interface CreateUserFromRequestPayload {
  username: string;
  password: string;
}