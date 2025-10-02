// src/pages/auth/SessionExpiredPage.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiAlertTriangle, FiEye, FiEyeOff } from "react-icons/fi";
import login from "@/service/auth/login";
import { saveSession } from "@/service/session";

// ¡OJO! mapa real: 1=admin, 2=médico, 3=enfermero
function getLandingRoute(roleId: number): string {
  switch (roleId) {
    case 1: return "/registro-personal"; // admin
    case 2: return "/consultas-medico";  // médico
    case 3: return "/triaje";            // enfermero (ajusta si usas /consultas)
    default: return "/";
  }
}

export default function SessionExpiredPage() {
  const navigate = useNavigate();

  // lee la ruta previa y el motivo desde sessionStorage (no hay state en window.replace)
  const { fromPath, reason } = useMemo(() => {
    const from = sessionStorage.getItem("last_path") || "/";
    const r = sessionStorage.getItem("auth_reason") || "expired";
    return { fromPath: from, reason: r };
  }, []);

  // ---- estado del login (misma lógica que LoginPage) ----
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // limpia el motivo para que no se quede pegado si recarga
    sessionStorage.removeItem("auth_reason");
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login({ username, password });
      saveSession(data);

      // si quieres volver exactamente a donde estaba:
      const roleId = Number(data?.role_id);
      const landing = getLandingRoute(roleId);

      // Decide destino post-login:
      const dest = fromPath && fromPath !== "/" ? fromPath : landing;

      // opcional: valida que dest no sea público ("/", "/auth-required", "/session-expired", etc.)
      const isBlocked = /^\/(auth-required|session-expired|access-request)?$/.test(new URL(dest, window.location.origin).pathname);
      navigate(isBlocked ? landing : dest, { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "No se pudo iniciar sesión";
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200">
      {/* decorativos */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
          {/* Encabezado */}
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-200">
              SIRA • Salud Respiratoria
            </div>
            <h1 className="mt-4 text-2xl font-bold text-slate-800">Sesión expirada</h1>
            <p className="mt-2 text-sm text-slate-500">
              Por motivos de seguridad, tu sesión ha expirado en SIRA. {reason === "expired" ? "Vuelve a ingresar para continuar." : "Ingresa para acceder."}
            </p>
          </div>

          {/* Ícono y detalle */}
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 ring-1 ring-orange-100">
              <FiAlertTriangle className="text-orange-600" size={22} />
            </div>
            {fromPath !== "/" && (
              <p className="text-xs text-slate-500">
                Ruta previa: <span className="font-medium text-slate-700 break-all">{fromPath}</span>
              </p>
            )}
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600" htmlFor="username">Usuario</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none ring-0 transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
                placeholder="Ingresa tu usuario"
                autoComplete="username"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600" htmlFor="password">Contraseña</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 pr-10 text-sm text-slate-800 outline-none ring-0 transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-2 inline-flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  checked={remember}
                  onChange={() => setRemember((v) => !v)}
                />
                Recordarme en este dispositivo
              </label>
              <Link to="/access-request" className="text-xs font-medium text-blue-700 hover:underline">
                Solicitar acceso
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative inline-flex w-full items-center justify-center overflow-hidden rounded-xl bg-blue-600 px-4 py-2.5 font-medium text-white shadow-md transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-60"
            >
              <span className="absolute inset-0 -translate-y-full bg-white/20 transition-transform group-hover:translate-y-0" />
              {loading ? "Ingresando..." : "Volver a ingresar"}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-600">
            Si crees que es un error, vuelve a intentar o contacta al administrador del sistema.
          </div>
        </div>
      </div>
    </div>
  );
}
