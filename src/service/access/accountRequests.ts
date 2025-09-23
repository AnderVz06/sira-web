import api from "@/service/apiClient";
import { ENDPOINTS } from "@/service/endpoints";
import type { AccountRequest, CreateAccountRequestPayload, CreateUserFromRequestPayload } from "@/types/accountRequests";


/** (UX) Chequeo local de admin. La seguridad real debe estar en el backend. */
const ADMIN_ROLE_ID = 1;
function ensureAdmin() {
  const raw = localStorage.getItem("auth_role_id");
  const roleId = raw ? Number(raw) : NaN;
  if (roleId !== ADMIN_ROLE_ID) {
    const err = new Error("No autorizado: se requiere role_id = 1.");
    (err as any).code = "ERR_FORBIDDEN";
    (err as any).status = 403;
    throw err;
  }
}

export type ApproveResponse = { message: string };
export type CreateUserResponse = { message: string };

/** GET /api/v1/account-requests/  (solo admin) */
export async function getAccountRequests(): Promise<AccountRequest[]> {
  ensureAdmin();
  const { data } = await api.get<AccountRequest[]>(ENDPOINTS.accountRequests.list);
  return data;
}

/** POST /api/v1/account-requests/  (público) */
export async function createAccountRequest(
  payload: CreateAccountRequestPayload
): Promise<AccountRequest> {
  const { data } = await api.post<AccountRequest>(ENDPOINTS.accountRequests.create, payload);
  return data;
}

/** POST /api/v1/account-requests/{request_id}/approve  (solo admin) */
export async function approveAccountRequest(requestId: number): Promise<ApproveResponse> {
  ensureAdmin();
  const { data } = await api.post<ApproveResponse>(ENDPOINTS.accountRequests.approve(requestId));
  return data; // ← ahora devolvemos { message }
}

/** POST /api/v1/account-requests/{request_id}/create-user  (solo admin) */
export async function createUserFromAccountRequest(
  requestId: number,
  payload: CreateUserFromRequestPayload
): Promise<CreateUserResponse> {
   const { data } =
  await api.post(ENDPOINTS.accountRequests.createUser(requestId), payload);
  return data;
}
