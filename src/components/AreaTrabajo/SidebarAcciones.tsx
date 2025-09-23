import { FiFileText, FiCheckCircle, FiTrash2, FiPlus } from "react-icons/fi";
import { HiOutlineDocumentReport, HiOutlineAnnotation } from "react-icons/hi";
import { HiOutlineClipboardList } from "react-icons/hi";
import type { Tool } from "@/hooks/history/useBloques";

type ToolKey = "receta" | "indicaciones" | "diagnostico" | "notas";

export default function SidebarAcciones({
  accion,
  setAccion,
  canConfirm,
  onConfirm,
  onDiscard,
  onNuevaConsulta,
  usedTools,
}: {
  accion: Tool;
  setAccion: (t: Tool) => void;
  canConfirm: boolean;
  onConfirm: () => void;
  onDiscard: () => void;
  onNuevaConsulta?: () => void;
  /** herramientas ya usadas en este caso (una sola vez por tipo) */
  usedTools: Set<ToolKey>;
}) {
  const isUsed = (t: ToolKey) => usedTools.has(t);

  const btnCls = (active: boolean, base: string, activeCls: string) =>
    `h-12 w-12 rounded-2xl grid place-content-center ring-1 transition-colors ${
      active ? activeCls : base
    }`;

  return (
    <aside className="block col-span-1 h-full">
      {/* sticky + scroll interno */}
      <div className="bg-white rounded-3xl ring-1 ring-slate-200 shadow p-3 sticky top-6 max-h-[calc(100vh-2rem)] overflow-y-auto">
        <div className="flex flex-col items-center gap-3">
          {/* Receta */}
          <button
            onClick={() => !isUsed("receta") && setAccion("receta")}
            title={isUsed("receta") ? "Receta (ya agregada)" : "Receta"}
            aria-label="Receta"
            className={btnCls(accion === "receta", "bg-slate-50 text-blue-700 hover:bg-slate-100 ring-slate-200", "bg-blue-600 text-white ring-blue-500")}
            disabled={isUsed("receta")}
          >
            <FiFileText size={18} />
          </button>

          {/* Indicaciones */}
          <button
            onClick={() => !isUsed("indicaciones") && setAccion("indicaciones")}
            title={isUsed("indicaciones") ? "Indicaciones (ya agregadas)" : "Indicaciones"}
            aria-label="Indicaciones"
            className={btnCls(accion === "indicaciones", "bg-slate-50 text-teal-700 hover:bg-slate-100 ring-slate-200", "bg-teal-600 text-white ring-teal-500")}
            disabled={isUsed("indicaciones")}
          >
            <HiOutlineClipboardList size={18} />
          </button>

          {/* Diagnóstico */}
          <button
            onClick={() => !isUsed("diagnostico") && setAccion("diagnostico")}
            title={isUsed("diagnostico") ? "Diagnóstico (ya agregado)" : "Diagnóstico preliminar"}
            aria-label="Diagnóstico preliminar"
            className={btnCls(accion === "diagnostico", "bg-slate-50 text-amber-700 hover:bg-slate-100 ring-slate-200", "bg-amber-500 text-white ring-amber-400")}
            disabled={isUsed("diagnostico")}
          >
            <HiOutlineDocumentReport size={18} />
          </button>

          {/* Notas */}
          <button
            onClick={() => !isUsed("notas") && setAccion("notas")}
            title={isUsed("notas") ? "Notas (ya agregadas)" : "Notas"}
            aria-label="Notas"
            className={btnCls(accion === "notas", "bg-slate-50 text-violet-700 hover:bg-slate-100 ring-slate-200", "bg-violet-600 text-white ring-violet-500")}
            disabled={isUsed("notas")}
          >
            <HiOutlineAnnotation size={18} />
          </button>

          {/* Separador */}
          <div className="my-2 pt-2 border-t border-slate-200 w-full" />

          {/* Confirmar / Descartar */}
          <button
            className={`h-10 w-10 rounded-xl grid place-content-center ring-1
              ${
                canConfirm
                  ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100 ring-emerald-200"
                  : "text-emerald-400 bg-emerald-50 ring-emerald-100 opacity-60 cursor-not-allowed"
              }`}
            title="Confirmar (registrar consulta y enviar predicción)"
            aria-label="Confirmar"
            onClick={onConfirm}
            disabled={!canConfirm}
          >
            <FiCheckCircle size={18} />
          </button>

          <button
            className="h-10 w-10 rounded-xl grid place-content-center text-red-700 bg-red-50 hover:bg-red-100 ring-1 ring-red-200"
            title="Descartar bloques"
            aria-label="Descartar"
            onClick={onDiscard}
          >
            <FiTrash2 size={18} />
          </button>

          {/* Nueva consulta (opcional) */}
          <div className="mt-auto pb-1">
            <button
              className="mt-2 h-11 w-11 rounded-full bg-white text-blue-700 font-semibold shadow hover:shadow-md grid place-content-center ring-1 ring-slate-200"
              title="Nueva consulta"
              aria-label="Nueva consulta"
              onClick={onNuevaConsulta}
            >
              <FiPlus />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
