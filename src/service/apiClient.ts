import axios, { AxiosHeaders } from "axios";
import { API_BASE_URL, HTTP_LOGS } from "@/config";
import { getToken, getTokenType, clearSession } from "@/service/session";

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const isLogin = config.url?.includes("/auth/login");
  if (!isLogin) {
    const token = getToken();
    const tokenType = getTokenType().toLowerCase();
    if (token) {
      const scheme = tokenType === "bearer" ? "Bearer" : tokenType;
      config.headers = AxiosHeaders.from(config.headers);
      (config.headers as AxiosHeaders).set("Authorization", `${scheme} ${token}`);
    }
  }
  if (HTTP_LOGS) {
    console.debug("[HTTP][REQ]", config.method?.toUpperCase(), config.url, {
      params: config.params,
      data: config.data,
    });
  }
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
    if (error?.response?.status === 401) {
      clearSession();
    }
    return Promise.reject(error);
  }
);

export default api;
