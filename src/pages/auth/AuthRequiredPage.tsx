// src/pages/auth/AuthRequiredPage.tsx
import { Link, useLocation } from "react-router-dom";
import { FiLock } from "react-icons/fi";

export default function AuthRequiredPage() {
  const location = useLocation() as any;
  const from = location.state?.from?.pathname || "/";

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200">
      {/* blobs decorativos, igual que en LoginForm */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
          {/* Encabezado */}
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-200">
              SIRA • Salud Respiratoria
            </div>
            <h1 className="mt-4 text-2xl font-bold text-slate-800">Necesitas autenticarte</h1>
            <p className="mt-2 text-sm text-slate-500">
              Para acceder a esta sección debes iniciar sesión con tu cuenta.
            </p>
          </div>

          {/* Ícono y detalle */}
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 ring-1 ring-blue-100">
              <FiLock className="text-blue-600" size={22} />
            </div>
            {from !== "/" && (
              <p className="text-xs text-slate-500">
                Ruta solicitada: <span className="font-medium text-slate-700">{from}</span>
              </p>
            )}
          </div>

          {/* Botones de acción (mismo estilo que el login) */}
          <div className="space-y-3">
            <Link
              to="/"
              state={{ from }}
              className="group relative inline-flex w-full items-center justify-center overflow-hidden rounded-xl bg-blue-600 px-4 py-2.5 font-medium text-white shadow-md transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <span className="absolute inset-0 -translate-y-full bg-white/20 transition-transform group-hover:translate-y-0" />
              Ir al login
            </Link>

            <Link
              to="/access-request"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-xs font-medium text-slate-700 shadow-sm backdrop-blur transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500/80" />
              Solicitar acceso
            </Link>
          </div>

          {/* Pie (opcional) */}
          <div className="mt-6 text-center text-xs text-slate-600">
            Si cree que es un error, contacte al administrador del sistema.
          </div>
        </div>
      </div>
    </div>
  );
}
