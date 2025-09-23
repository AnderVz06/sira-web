// src/components/consultas/ConsultaCard.tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ConsultaUI } from "@/types/consultation";
import EditarConsultaModal from "@/components/consultas/editarConsultaModal"; // <-- ajusta la ruta

const ROLE_ENFERMERO = 3;
function getCurrentRoleId(): number | undefined {
  const rawA = localStorage.getItem("auth_role_id") ?? sessionStorage.getItem("auth_role_id");
  const rawB = localStorage.getItem("role_id") ?? sessionStorage.getItem("role_id");
  const raw = rawA ?? rawB;
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) ? n : undefined;
}

const statusMap = {
  "En espera": { text: "text-amber-800", bg: "bg-amber-50", ring: "ring-amber-200" },
  "Terminado": { text: "text-slate-700", bg: "bg-slate-100", ring: "ring-slate-200" },
  "Cancelado": { text: "text-rose-800", bg: "bg-rose-50", ring: "ring-rose-200" },
} as const;

function formatDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }).replace(/\./g, "");
}
function formatTime(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}
function fmtCountdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const mm = Math.floor(total / 60);
  const ss = total % 60;
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${pad(mm)}:${pad(ss)}`;
}

export default function ConsultaCard({
  item,
  position,
  canRealizar = false,
  onRealizar,
  onEditar,          // opcional: si lo pasas, se usa. Si no, abrimos el modal
  onSaveEdit,        // opcional: callback para guardar cambios del modal
  editStartIso,      // opcional: fecha_registro del historial para ventana de edición
}: {
  item: ConsultaUI;
  position: number;
  canRealizar?: boolean;
  onRealizar?: () => void;
  onEditar?: () => void;
  onSaveEdit?: (payload: any) => Promise<void> | void; // si tienes el tipo exacto, usa Partial<PredictRecord>
  editStartIso?: string;
}) {
  const navigate = useNavigate();
  const [showEdit, setShowEdit] = useState(false); // <-- control del modal

  const roleId = getCurrentRoleId();
  const isEnfermero = roleId === ROLE_ENFERMERO;

  // Nombre / iniciales
  const nombre = (item.nombre ?? "").trim();
  const apellido = (item.apellido ?? "").trim();
  const fullName = (nombre || apellido) ? `${nombre} ${apellido}`.trim() : "";
  const displayName = fullName || `Paciente ${item.dni || item.hce || ""}`.trim();
  const parts = displayName.split(/\s+/).filter(Boolean);
  const initials = (parts[0]?.[0] ?? "").toUpperCase() + (parts[1]?.[0] ?? "").toUpperCase();

  // Chip por estado
  const estadoStr = String(item.estado);
  const chip =
    (statusMap as Record<string, (typeof statusMap)[keyof typeof statusMap]>)[estadoStr] ??
    { text: "text-slate-700", bg: "bg-slate-50", ring: "ring-slate-200" };

  // ===== Ventana de edición (5 min) =====
  const isTerminado = estadoStr === "Terminado";
  const EDIT_WINDOW_MS = 5 * 60 * 1000;

  // Si viene por prop (fecha_registro), úsalo como inicio
  const propStartMs = editStartIso ? new Date(editStartIso).getTime() : NaN;

  // Clave estable para guardar el inicio local en localStorage (si no hay prop)
  const getEditKey = () => {
    const anyItem = item as any;
    const idish =
      anyItem.id ??
      `${item.dni ?? ""}-${item.hce ?? ""}-${item.cita ?? ""}`;
    return `consulta:${idish}:edit_start`;
  };

  // Guardamos el inicio UNA sola vez
  const baseStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isTerminado) {
      baseStartRef.current = null; // si cambia el estado, resetea la referencia (no borra localStorage)
      return;
    }
    if (baseStartRef.current != null) return; // ya fijado

    let start = Number.isFinite(propStartMs) ? propStartMs : NaN;

    if (!Number.isFinite(start)) {
      // intenta recuperar de localStorage
      const saved = localStorage.getItem(getEditKey());
      const savedN = saved ? Number(saved) : NaN;
      if (Number.isFinite(savedN)) start = savedN;
    }

    if (!Number.isFinite(start)) {
      // último recurso: ahora (y persistimos para no resetear en remontajes)
      start = Date.now();
      localStorage.setItem(getEditKey(), String(start));
    }

    baseStartRef.current = start;
  }, [isTerminado, propStartMs]); // se fija solo una vez por transición a Terminado

  // Ticker 1s mientras esté en Terminado
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!isTerminado) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isTerminado]);

  const baseStartMs = baseStartRef.current ?? NaN;
  const remainingMs =
    isTerminado && Number.isFinite(baseStartMs)
      ? baseStartMs + EDIT_WINDOW_MS - now
      : -1;

  const canEditNow = isTerminado && Number.isFinite(baseStartMs) && remainingMs > 0;

  // Acción Editar: si pasas onEditar, la usamos; si no, abrimos el modal local
  const goToEdit = () => {
    if (onEditar) {
      onEditar();
      return;
    }
    // Abrir modal local
    setShowEdit(true);
  };

  return (
    <>
      <div className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-[0_10px_34px_rgba(2,6,23,0.08)] p-5 hover:shadow-[0_18px_44px_rgba(2,6,23,0.14)] transition-all duration-200 flex flex-col">
        {/* Cabecera */}
        <div className="flex items-start justify-between gap-4 w-full">
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative shrink-0">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-500 text-white font-bold grid place-content-center shadow-md">
                {initials || "⦿"}
              </div>
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-blue-600 text-white text-[10px] font-bold grid place-content-center ring-2 ring-white shadow">
                {position}
              </div>
            </div>

            <div className="min-w-0">
              <div className="text-[15px] font-extrabold text-slate-900 leading-tight truncate">
                {displayName}
              </div>
              <div className="mt-1 text-[12px] text-slate-500 truncate">
                HCE: <span className="font-medium">{item.hce || "—"}</span>
              </div>
              <div className="mt-0.5 text-[12px] text-slate-500">
                DNI: <span className="font-medium">{item.dni || "—"}</span>
              </div>
            </div>
          </div>

          <div className="shrink-0">
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[12px] font-semibold ring-1 ${chip.bg} ${chip.text} ${chip.ring} shadow-sm`}>
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-current opacity-60" />
              {estadoStr}
            </span>
          </div>
        </div>

        <div className="mt-4 h-px bg-slate-200/70 w-full" />

        {/* Cita */}
        <div className="rounded-xl bg-gradient-to-br from-slate-50 to-white ring-1 ring-slate-200 p-3 w-full text-center">
          <div className="text-slate-700 text-xs font-medium">{formatDate(item.cita)}</div>
          <div className="mt-1 text-slate-900 text-2xl font-extrabold leading-none">
            {formatTime(item.cita)}
          </div>
        </div>

        {/* Acciones (ocultar para enfermería) */}
        {!isEnfermero && (
          <div className="mt-4 w-full">
            {isTerminado ? (
              canEditNow ? (
                <button
                  onClick={goToEdit}
                  className="w-full h-12 rounded-xl font-semibold text-base shadow transition-all bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-md"
                  title="Editar consulta recién terminada"
                >
                  Editar consulta
                  <span className="ml-2 text-white/80 text-xs">({fmtCountdown(remainingMs)})</span>
                </button>
              ) : (
                <button
                  disabled
                  className="w-full h-12 rounded-xl font-semibold text-base shadow bg-slate-200 text-slate-500 cursor-not-allowed"
                  title="Ventana de edición expirada"
                >
                  Consulta terminada
                </button>
              )
            ) : estadoStr === "En espera" ? (
              <button
                onClick={onRealizar}
                disabled={!canRealizar}
                className={[
                  "w-full h-12 rounded-xl font-semibold text-base shadow transition-all",
                  canRealizar
                    ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md"
                    : "bg-slate-200 text-slate-500 cursor-not-allowed",
                ].join(" ")}
                title={canRealizar ? "Iniciar atención" : "No disponible aún"}
              >
                Realizar consulta
              </button>
            ) : null /* Cancelado: sin botón */}
          </div>
        )}
      </div>

      {/* ===== Modal de edición local ===== */}
      {showEdit && (
        <EditarConsultaModal
          open={showEdit}
          onClose={() => setShowEdit(false)}
          dni={item.dni ?? null}
        />
      )}
    </>
  );
}
