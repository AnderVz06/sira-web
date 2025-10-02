import api from "@/service/apiClient";
import { ENDPOINTS } from "@/service/endpoints";
import type { User, UpdateUserPayload, ChangePasswordPayload, UserMedico } from "@/types/user";

const ADMIN_ROLE_ID = 1;

function ensureAdmin() {
  const stored = localStorage.getItem("auth_role_id");
  const roleId = stored ? Number(stored) : NaN;
  if (roleId !== ADMIN_ROLE_ID) {
    const err = new Error("No autorizado: se requiere role_id = 1 (admin).");
    (err as any).code = "ERR_FORBIDDEN";
    (err as any).status = 403;
    throw err;
  }
}

/** GET /users/ — solo admin */
export default async function listUsers(): Promise<User[]> {
  ensureAdmin(); // chequeo local, la seguridad real va en el backend
  const { data } = await api.get<User[]>(ENDPOINTS.users.list);
  return data;
}
/** GET /users/{user_id} — solo admin */
export async function getUserById(userId: number): Promise<User> {
  ensureAdmin();
  const { data } = await api.get<User>(ENDPOINTS.users.byId(userId));
  return data;
}

/** DELETE /users/{user_id} — solo admin */
export async function deleteUser(userId: number): Promise<void> {
  ensureAdmin();
  await api.delete(ENDPOINTS.users.byId(userId));
}

/** PUT /users/{user_id} */
export async function updateUser(userId: number, payload: UpdateUserPayload): Promise<User> {
  const { data } = await api.put<User>(ENDPOINTS.users.byId(userId), payload);
  return data;
}

/** PUT /users/{user_id}/change-password */
export async function changePassword(userId: number, payload: ChangePasswordPayload): Promise<void> {
  await api.put(ENDPOINTS.users.changePassword(userId), payload);
}


export async function listMedicos(/* search?: string */): Promise<UserMedico[]> {
  const { data } = await api.get<UserMedico[]>(ENDPOINTS.users.medicos());
  return Array.isArray(data) ? data : [];
}