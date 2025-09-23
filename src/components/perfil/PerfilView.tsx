// src/components/perfil/PerfilView.tsx
import { useMemo } from "react";
import {
  FiMail,
  FiUser,
  FiBriefcase,
  FiShield,
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiLock,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import type { MeResponse } from "@/service/auth/login";

type Props = {
  me: MeResponse | null;
  loading: boolean;
  error: string | null;
  onReload: () => void;
};

export default function PerfilView({ me, loading, error, onReload }: Props) {
  const initials = useMemo(() => {
    if (!me?.full_name) return "";
    return me.full_name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("");
  }, [me?.full_name]);

  const roleName = useMemo(() => {
    switch (me?.role_id) {
      case 1:
        return "Administrador";
      case 2:
        return "Médico";
      case 3:
        return "Enfermero";
      default:
        return me?.role_id != null ? `Rol ${me.role_id}` : "—";
    }
  }, [me?.role_id]);

  const formatDate = (iso?: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return new Intl.DateTimeFormat("es-PE", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 via-slate-50 to-white">
      <div className="flex-1 pl-[5px] flex">
        <div className="w-full min-h-screen bg-white/80 backdrop-blur-sm rounded-3xl shadow-[0_20px_60px_rgba(2,6,23,0.12)] ring-1 ring-slate-200 flex flex-col overflow-hidden">
          {/* HERO */}
          <section className="px-6 md:px-10 pt-6 pb-4">
            <div className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-500 p-6 flex items-center gap-3 sm:gap-5 shadow-lg ring-1 ring-white/20 flex-wrap">
              <div className="flex-1 min-w-[260px]">
                <p className="text-blue-100 text-xs font-medium tracking-wide mb-1">
                  Cuenta • Perfil
                </p>
                <h1 className="text-3xl font-extrabold text-white">Mi perfil</h1>
                <p className="text-blue-100 text-sm mt-1">
                  Información de tu cuenta y detalles del acceso.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onReload}
                  className="h-10 px-3 rounded-xl bg-white text-blue-700 text-sm font-semibold shadow hover:shadow-md inline-flex items-center gap-2"
                >
                  <FiRefreshCw /> Actualizar
                </button>
                <Link
                  to="/cambiar-contraseña"
                  className="h-10 px-3 rounded-xl bg-indigo-50 text-white text-sm font-semibold shadow hover:shadow-md inline-flex items-center gap-2 ring-1 ring-white/20"
                  style={{ background: "rgba(255,255,255,0.15)" }}
                >
                  <FiLock /> Cambiar contraseña
                </Link>
              </div>
            </div>
          </section>

          {/* Contenido */}
          <main className="flex-1 min-h-0 overflow-auto p-6 md:p-10 pt-2 pb-20">
            {loading && (
              <div className="mt-2 text-sm text-slate-600">Cargando perfil…</div>
            )}
            {error && (
              <div className="mt-2 text-sm text-rose-700 bg-rose-50 ring-1 ring-rose-200 rounded-xl p-3">
                {error}
              </div>
            )}

            {me && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Columna izquierda: resumen */}
                <section className="lg:col-span-4">
                  <div className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-500 text-white grid place-items-center text-2xl font-bold shadow">
                        {initials || <FiUser />}
                      </div>
                      <div>
                        <div className="text-xl font-semibold text-slate-800">
                          {me.full_name}
                        </div>
                        <div className="text-slate-500 text-sm flex items-center gap-1">
                          <FiMail /> {me.email || "—"}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-3">
                      <div className="flex items-start gap-3">
                        <span className="inline-flex items-center rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-200 px-2.5 py-1 text-xs font-medium">
                          <FiBriefcase className="mr-1" /> {me.area || "Sin área"}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium ring-1 ${
                            me.enabled
                              ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                              : "bg-rose-50 text-rose-700 ring-rose-200"
                          }`}
                        >
                          {me.enabled ? (
                            <>
                              <FiCheckCircle className="mr-1" /> Activo
                            </>
                          ) : (
                            <>
                              <FiXCircle className="mr-1" /> Inactivo
                            </>
                          )}
                        </span>
                      </div>

                      <div className="text-sm text-slate-600 mt-2 flex items-center gap-2">
                        <FiCalendar />
                        Último acceso:{" "}
                        <span className="font-medium text-slate-800">
                          {formatDate(me.ultimo_accesso)}
                        </span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Columna derecha: detalles */}
                <section className="lg:col-span-8">
                  <div className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm">
                    <div className="border-b border-slate-200 px-6 py-4">
                      <h2 className="text-base font-semibold text-slate-800">
                        Detalles de la cuenta
                      </h2>
                      <p className="text-sm text-slate-500">
                        Datos técnicos y de identificación.
                      </p>
                    </div>

                    {/* Grid 2x2: Usuario, Correo, Rol, Área */}
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="rounded-xl ring-1 ring-slate-200 p-4 bg-white">
                        <div className="text-xs uppercase tracking-wide text-slate-500">
                          Usuario
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-slate-800 font-medium">
                          <FiUser /> {me.username || "—"}
                        </div>
                      </div>

                      <div className="rounded-xl ring-1 ring-slate-200 p-4 bg-white">
                        <div className="text-xs uppercase tracking-wide text-slate-500">
                          Correo
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-slate-800 font-medium break-all">
                          <FiMail /> {me.email || "—"}
                        </div>
                      </div>

                      <div className="rounded-xl ring-1 ring-slate-200 p-4 bg-white">
                        <div className="text-xs uppercase tracking-wide text-slate-500">
                          Rol
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-slate-800 font-medium">
                          <FiShield /> {roleName}
                        </div>
                      </div>

                      <div className="rounded-xl ring-1 ring-slate-200 p-4 bg-white">
                        <div className="text-xs uppercase tracking-wide text-slate-500">
                          Área
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-slate-800 font-medium">
                          <FiBriefcase /> {me.area || "—"}
                        </div>
                      </div>
                    </div>

                    {/* Bloque de seguridad: botón para cambiar contraseña */}
                    <div className="px-6 pb-6">
                      <div className="rounded-xl ring-1 ring-slate-200 p-4 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="text-sm text-slate-600">
                          Mantén tu cuenta segura actualizando tu contraseña de forma periódica.
                        </div>
                        <Link
                          to="/cambiar-contraseña"
                          className="h-9 px-3 rounded-lg bg-blue-600 text-white text-sm font-medium shadow hover:bg-blue-700 inline-flex items-center gap-2"
                        >
                          <FiLock /> Cambiar contraseña
                        </Link>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {!loading && !error && !me && (
              <div className="mt-10 text-center text-slate-500">
                No se encontró información de tu perfil.
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
