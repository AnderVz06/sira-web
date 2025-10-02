// src/components/consultas/ConsultaCard.tsx
import { useEffect, useRef, useState } from "react";
import type { ConsultaUI } from "@/types/consultation";
import EditarConsultaModal from "@/components/consultas/editarConsultaModal";
import { setConsultaEditStatus } from "@/service/consultation/consultation"; // PATCH true/false

// Mapa de roles (1=admin, 2=médico, 3=enfermero)
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

// Resuelve el inicio de ventana (prop ISO o (anio,mes,dia,hora,minuto) o "ahora")
function resolveStartMs(editStartIso?: string, item?: ConsultaUI) {
  const p = editStartIso ? new Date(editStartIso).getTime() : NaN;
  if (Number.isFinite(p)) return p;

  const a = (item as any)?.anio;
  const m = (item as any)?.mes; // 1..12
  const d = (item as any)?.dia;
  const h = (item as any)?.hora;
  const i = (item as any)?.minuto;
  if ([a, m, d, h, i].every((v) => Number.isFinite(Number(v)))) {
    const dt = new Date(+a, +m - 1, +d, +h, +i, 0, 0);
    const t = dt.getTime();
    if (Number.isFinite(t)) return t;
  }
  return Date.now();
}

export default function ConsultaCard({
  item,
  position,
  canRealizar = false,
  onRealizar,
  onEditar,
  onSaveEdit,
  editStartIso,
}: {
  item: ConsultaUI;
  position: number;
  canRealizar?: boolean;
  onRealizar?: () => void;
  onEditar?: () => void;
  onSaveEdit?: (payload: any) => Promise<void> | void;
  editStartIso?: string;
}) {
  const [showEdit, setShowEdit] = useState(false);

  const roleId = getCurrentRoleId();
  const isEnfermero = roleId === ROLE_ENFERMERO;

  // Nombre / iniciales
  const nombre = (item.nombre ?? "").trim();
  const apellido = (item.apellido ?? "").trim();
  const fullName = (nombre || apellido) ? `${nombre} ${apellido}`.trim() : "";
  const displayName = fullName || `Paciente ${item.dni || item.hce || ""}`.trim();
  const parts = displayName.split(/\s+/).filter(Boolean);
  const initials = (parts[0]?.[0] ?? "").toUpperCase() + (parts[1]?.[0] ?? "").toUpperCase();

  // Estado y chip
  const estadoStr = String(item.estado);
  const isTerminado = estadoStr === "Terminado";
  const chip =
    (statusMap as Record<string, (typeof statusMap)[keyof typeof statusMap]>)[estadoStr] ??
    { text: "text-slate-700", bg: "bg-slate-50", ring: "ring-slate-200" };

  // ===== LÓGICA DE EDIT (enganche a edit_status del backend) =====
  const EDIT_WINDOW_MS = 5 * 60 * 1000;

  // 1) Estado de edición del BACK (clave para mostrar/ocultar timer)
  const [serverEditStatus, setServerEditStatus] = useState<boolean>(Boolean((item as any).edit_status));
  useEffect(() => {
    setServerEditStatus(Boolean((item as any).edit_status));
  }, [(item as any).edit_status]);

  // 2) Clave estable para storage local
  const getEditKey = () => {
    const anyItem = item as any;
    const idish = anyItem.id ?? `${item.dni ?? ""}-${item.hce ?? ""}-${item.cita ?? ""}`;
    return `consulta:${idish}:edit_start`;
  };

  // 3) Guardamos inicio solo si: Terminado **y** edit_status === true
  const baseStartRef = useRef<number | null>(null);
  useEffect(() => {
    if (!isTerminado) {
      baseStartRef.current = null;
      return;
    }

    // Si el backend dice que NO hay edición, no hay timer y limpiamos storage
    if (!serverEditStatus) {
      baseStartRef.current = NaN;
      localStorage.removeItem(getEditKey());
      return;
    }

    // Ya fijado
    if (baseStartRef.current != null) return;

    // Recuperar/persistir inicio
    const saved = localStorage.getItem(getEditKey());
    if (saved) {
      baseStartRef.current = Number(saved);
      return;
    }
    const start = resolveStartMs(editStartIso, item);
    baseStartRef.current = start;
    localStorage.setItem(getEditKey(), String(start));
  }, [isTerminado, serverEditStatus, editStartIso, item]);

  // 4) Ticker solo cuando está Terminado **y** edit_status === true
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!isTerminado || !serverEditStatus) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isTerminado, serverEditStatus]);

  // 5) Cómputos (solo si el servidor permite editar)
  const baseStartMs = baseStartRef.current ?? NaN;
  const remainingMs =
    isTerminado && serverEditStatus && Number.isFinite(baseStartMs)
      ? baseStartMs + EDIT_WINDOW_MS - now
      : -1;

  // Habilitado si: Terminado + servidor permite + tiempo > 0
  const canEditNow = isTerminado && serverEditStatus && Number.isFinite(baseStartMs) && remainingMs > 0;

  // 6) Al expirar: PATCH { edit_status:false }, actualizar estado y limpiar storage
  const firedRef = useRef(false);
  useEffect(() => {
    if (!isTerminado || !serverEditStatus) return;
    if (remainingMs <= 0 && !firedRef.current && Number.isFinite(baseStartMs)) {
      firedRef.current = true;
      (async () => {
        try {
          const id = (item as any).id;
          if (Number.isFinite(Number(id))) {
            const updated = await setConsultaEditStatus(Number(id), false);
            setServerEditStatus(Boolean(updated?.edit_status ?? false));
          } else {
            setServerEditStatus(false);
          }
        } catch (e) {
          console.error("No se pudo deshabilitar edición:", e);
          // Aunque falle, ocultamos timer localmente
          setServerEditStatus(false);
        } finally {
          localStorage.removeItem(getEditKey());
        }
      })();
    }
  }, [remainingMs, isTerminado, serverEditStatus, baseStartMs, item]);

  // === NUEVO: deshabilitar edición inmediatamente tras guardar en el modal ===
  const disableEditingNow = async () => {
    try {
      const id = (item as any).id;
      if (Number.isFinite(Number(id))) {
        // Mantén backend consistente
        await setConsultaEditStatus(Number(id), false);
      }
    } catch (e) {
      console.warn("No se pudo deshabilitar edición en el servidor, se desactiva localmente:", e);
    } finally {
      // apaga timer y limpia storage local
      setServerEditStatus(false);
      baseStartRef.current = NaN;
      localStorage.removeItem(getEditKey());
    }
  };

  // Acción Editar
  const goToEdit = () => {
    if (!canEditNow) return;
    if (onEditar) {
      onEditar();
      return;
    }
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
            {estadoStr === "Cancelado" ? null : isTerminado ? (
              serverEditStatus ? (
                canEditNow ? (
                  <button
                    onClick={goToEdit}
                    className="w-full h-12 rounded-xl font-semibold text-base shadow transition-all bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-md"
                    title="Editar consulta (disponible por 5 min)"
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
              ) : (
                // edit_status === false => SIN TIMER
                <button
                  disabled
                  className="w-full h-12 rounded-xl font-semibold text-base shadow bg-slate-200 text-slate-500 cursor-not-allowed"
                  title="Edición no disponible"
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
            ) : null}
          </div>
        )}
      </div>

      {/* Modal de edición */}
      {showEdit && (
        <EditarConsultaModal
          open={showEdit}
          onClose={() => setShowEdit(false)}
          dni={item.dni ?? null}
          onSaved={async () => {
            await disableEditingNow(); // apaga timer + PATCH backend + limpia storage
            setShowEdit(false);
          }}
        />
      )}
    </>
  );
}
