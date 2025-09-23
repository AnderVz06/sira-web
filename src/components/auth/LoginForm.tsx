import { FormEvent } from "react";
import { Link } from "react-router-dom";
import { FiMail, FiLock } from "react-icons/fi";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

export type LoginFormProps = {
  username: string;
  password: string;
  showPassword: boolean;
  remember: boolean;
  loading: boolean;
  error: string;
  onUsernameChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onToggleShowPassword: () => void;
  onToggleRemember: () => void;
  onSubmit: (e: FormEvent) => void;
  onRequestAccess: () => void;
};

export default function LoginForm({
  username,
  password,
  showPassword,
  remember,
  loading,
  error,
  onUsernameChange,
  onPasswordChange,
  onToggleShowPassword,
  onToggleRemember,
  onSubmit,
  onRequestAccess,
}: LoginFormProps) {
  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center md:flex-row md:items-stretch">
        {/* Panel izquierdo (info) */}
        <section className="hidden w-1/2 flex-col justify-center p-12 md:flex">
          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-200">
              SIRA • Salud Respiratoria
            </div>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-800">
              Sistema de Detección Temprana de Enfermedades Respiratorias
            </h1>
            <p className="mt-3 text-slate-700">
              Acceda a paneles, triaje y resultados en un entorno seguro y simple.
            </p>
          </div>
        </section>

        {/* Panel derecho (formulario) */}
        <section className="flex w-full items-center justify-center p-6 md:w-1/2 md:p-12">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-slate-800">Bienvenido a SIRA</h2>
              <p className="text-sm text-slate-500">Ingrese sus credenciales para acceder</p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={onSubmit}>
              {/* Usuario */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Usuario</label>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-200">
                  <FiMail className="text-slate-400" />
                  <input
                    type="text"
                    placeholder="usuario"
                    value={username}
                    onChange={(e) => onUsernameChange(e.target.value)}
                    className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">Contraseña</label>
                  <Link to="#" className="text-xs text-blue-600 hover:underline">
                    ¿Olvidó su contraseña?
                  </Link>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-200">
                  <FiLock className="text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => onPasswordChange(e.target.value)}
                    className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={onToggleShowPassword}
                    className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                  </button>
                </div>
              </div>

              {/* Recordar sesión */}
              <div className="flex items-center justify-between">
                <label className="inline-flex cursor-pointer items-center gap-2">
                  <input
                    id="remember"
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    checked={remember}
                    onChange={onToggleRemember}
                  />
                  <span className="text-sm text-slate-700">Recordar sesión</span>
                </label>
              </div>

              {/* Botón */}
              <button
                type="submit"
                disabled={loading}
                className="group relative inline-flex w-full items-center justify-center overflow-hidden rounded-xl bg-blue-600 px-4 py-2.5 font-medium text-white shadow-md transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="absolute inset-0 -translate-y-full bg-white/20 transition-transform group-hover:translate-y-0" />
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                    Iniciando…
                  </span>
                ) : (
                  "Iniciar Sesión"
                )}
              </button>

              {/* CTA: solicitar acceso */}
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={onRequestAccess}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-xs font-medium text-slate-700 shadow-sm backdrop-blur transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500/80" />
                  No tienes acceso, solicítalo
                </button>
              </div>
            </form>

            {/* Pie */}
            <div className="mt-6 text-center text-xs text-slate-600 md:hidden">
              Si olvidó sus credenciales, contacte al administrador.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
