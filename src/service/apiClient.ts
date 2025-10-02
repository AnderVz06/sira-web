// src/service/api.ts
import axios, { AxiosHeaders } from "axios";
import { API_BASE_URL, HTTP_LOGS } from "@/config";
import { getToken, getTokenType, clearSession, getRoleId } from "@/service/session";
import { getLandingRoute } from "@/utils/roles";
import { isAuthzErrorMessage } from "@/service/httpErrors";

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const isLogin = config.url?.includes("/auth/login");
  if (!isLogin) {
    const token = getToken();
    const tokenType = (getTokenType() || "").toLowerCase();
    if (token) {
      const scheme = tokenType === "bearer" ? "Bearer" : (tokenType || "Bearer");
      config.headers = AxiosHeaders.from(config.headers);
      (config.headers as AxiosHeaders).set("Authorization", `${scheme} ${token}`);
    }
  }
  if (HTTP_LOGS) console.debug("[HTTP][REQ]", config.method?.toUpperCase(), config.url, { params: config.params, data: config.data });
  return config;
});

api.interceptors.response.use(
  (res) => {
    if (HTTP_LOGS) console.debug("[HTTP][RES]", res.config.url, res.status, res.data);
    return res;
  },
  (error) => {
    if (HTTP_LOGS) {
      console.debug("[HTTP][ERR]", error?.config?.url, error?.response?.status, error?.response?.data);
    }

    const status = error?.response?.status;
    const msg = String(error?.response?.data?.detail || error?.response?.data?.message || error?.message || "");

    if (status === 401) {
      // evita interferir con el propio /auth/login
      const url = String(error?.config?.url || "");
      const isLoginCall = url.includes("/auth/login");

      // Señales de que hubo sesión / había auth en esta request:
      const hadAuthHeader = !!(
        error?.config?.headers?.Authorization ||
        error?.config?.headers?.authorization
      );
      const hadSessionFlag = (() => {
        try { return sessionStorage.getItem("auth_had_session") === "1"; } catch { return false; }
      })();

      // Si hubo header o la pestaña tuvo sesión antes, lo tratamos como "expirada"
      const treatAsExpired = !isLoginCall && (hadAuthHeader || hadSessionFlag);

      try {
        const from = window.location.pathname + window.location.search + window.location.hash;
        sessionStorage.setItem("last_path", from);
        sessionStorage.setItem("auth_reason", treatAsExpired ? "expired" : "required");
      } catch {}

      // Limpia credenciales (pero NO borra auth_had_session)
      clearSession();

      const dest = treatAsExpired ? "/session-expired" : "/auth-required";
      if (!window.location.pathname.startsWith(dest)) {
        window.location.replace(dest);
      }
      return Promise.reject(error);
    }

    // 403 → sin permisos (manejo general)
    if (status === 403 || isAuthzErrorMessage(msg)) {
      const to = getLandingRoute(getRoleId());
      if (window.location.pathname !== to) {
        window.location.replace(to);
      }
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;
