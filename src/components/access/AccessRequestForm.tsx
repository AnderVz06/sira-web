import { FiMail, FiUser, FiHome } from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { AccessRoleId } from "@/types/access";

export type AccessRequestFormProps = {
  name: string;
  email: string;
  area: string;
  role: AccessRoleId | "";
  reason: string;
  loading: boolean;
  onNameChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onAreaChange: (v: string) => void;
  onRoleChange: (v: AccessRoleId | "") => void;
  onReasonChange: (v: string) => void;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  onBack: () => void;
};

export default function AccessRequestForm(props: AccessRequestFormProps) {
  const {
    name, email, area, role, reason, loading,
    onNameChange, onEmailChange, onAreaChange, onRoleChange, onReasonChange,
    onSubmit, onBack,
  } = props;

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200">
      <div className="pointer-events-none absolute -top-28 -left-24 h-72 w-72 rounded-full bg-blue-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-24 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />

      {/* Botón volver SIN cambios */}
      <header className="relative z-10 mx-auto max-w-7xl px-6 pt-10">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm backdrop-blur transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
        >
          ← Volver
        </button>
      </header>

      {/* Ajuste suave de posición */}
      <main className="relative z-10 mx-auto max-w-5xl px-6 py-8 -mt-2 md:-mt-3">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 text-center">
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-800">
              Solicite acceso al sistema
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Complete el formulario para que el equipo admin habilite su cuenta.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg backdrop-blur">
            <form onSubmit={onSubmit} className="space-y-5">
              {/* Nombre */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Nombre completo <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-200">
                  <FiUser className="text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => onNameChange(e.target.value)}
                    className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none"
                    placeholder="Ej. María Pérez"
                    required
                  />
                </div>
              </div>

              {/* Correo */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Correo electrónico <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-200">
                  <FiMail className="text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => onEmailChange(e.target.value)}
                    className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none"
                    placeholder="nombre@institucion.gob.pe"
                    required
                  />
                </div>
              </div>

              {/* Área (opcional) */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Área
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-200">
                  <FiHome className="text-slate-400" />
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => onAreaChange(e.target.value)}
                    className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none"
                    placeholder="Hospital XX / Área Respiratoria"
                  />
                </div>
              </div>

              {/* Rol solicitado */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Rol solicitado <span className="text-red-500">*</span>
                </label>
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-200">
                  <select
                    value={role === "" ? "" : role}
                    onChange={(e) =>
                      onRoleChange(e.target.value ? (Number(e.target.value) as AccessRoleId) : "")
                    }
                    className="w-full bg-transparent text-sm text-slate-800 outline-none"
                    required
                  >
                    <option value="" disabled>Seleccione un rol</option>
                    <option value={2}>Médico</option>
                    <option value={3}>Enfermero</option>
                  </select>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  El rol define los permisos dentro de SIRA.
                </p>
              </div>

              {/* Motivo */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Motivo / Justificación <span className="text-red-500">*</span>
                </label>
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm transition focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-200">
                  <textarea
                    value={reason}
                    onChange={(e) => onReasonChange(e.target.value)}
                    rows={4}
                    className="w-full resize-none bg-transparent p-3 text-sm text-slate-800 placeholder-slate-400 outline-none"
                    placeholder="Describe por qué necesitas acceso y tus tareas principales."
                    required
                  />
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={onBack}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span className="absolute inset-0 -translate-y-full bg-white/20 transition-transform group-hover:translate-y-0" />
                  {loading ? (
                    <>
                      <AiOutlineLoading3Quarters className="h-4 w-4 animate-spin" />
                      Enviando…
                    </>
                  ) : ("Enviar solicitud")}
                </button>
              </div>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            SIRA • Salud Respiratoria — Seguridad y privacidad primero
          </p>
        </div>
      </main>
    </div>
  );
}
