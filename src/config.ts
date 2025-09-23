// Base de la API (desde Vite .env) con fallback local
export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:8080/api/v1";

// Logs HTTP: "true"/"1" => true; resto => false
export const HTTP_LOGS: boolean = ["true", "1"].includes(
  String(import.meta.env.VITE_HTTP_LOGS ?? "").toLowerCase()
);
