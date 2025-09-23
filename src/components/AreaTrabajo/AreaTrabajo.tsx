import DiagnosticoPreliminarPanel from "./DiagnosticoPreliminarPanel";
import FormReceta from "./FormReceta";
import FormIndicaciones from "./FormIndicaciones";
import FormNotas from "./FormNotas";
import BlockCard from "./BlockCard";

import { uid } from "@/utils/uid";
import { buildConsolidadoFromBloques } from "@/utils/consolidarConsulta";
import { useVitalSignsCache } from "@/hooks/triaje/useVitalSignsCache";


import { isOutOfDomain, NON_RESP_RED_FLAGS } from "@/utils/non_respitatory";

import type { Block, Tool } from "@/hooks/history/useBloques";
import type { HistorialItem } from "@/types/history";
import { useRef, useState } from "react";

export default function AreaTrabajo({
  dni,
  accion,
  setAccion,
  bloques,
  agregarBloque,
  eliminarBloque,
  ultima,
  onConfirmConsulta,
}: {
  dni: string;
  accion: Tool;
  setAccion: (t: Tool) => void;
  bloques: Block[];
  agregarBloque: (b: Block) => void;
  eliminarBloque: (id: string) => void;
  ultima?: HistorialItem;
  onConfirmConsulta: (consolidado: Partial<HistorialItem>) => void;
}) {
  const topRef = useRef<HTMLDivElement>(null);

  const registrarConsultaDesdeBloques = () => {
    if (bloques.length === 0) return;
    const consolidado = buildConsolidadoFromBloques(bloques, ultima);
    onConfirmConsulta(consolidado);
  };

  // === Estado de edición: guardamos el bloque removido para restaurar o actualizar ===
  const [editState, setEditState] = useState<{
    id: string;
    type: Block["type"];
    payload: any;
    createdAt: string;
  } | null>(null);

  // ⬇️ Estado de error para el panel de diagnóstico
  const [diagError, setDiagError] = useState<string | null>(null);

  // Al presionar "Editar" en un BlockCard:
  const handleEdit = (b: Block) => {
    // 1) quitamos el bloque de la lista
    eliminarBloque(b.id);
    // 2) guardamos sus datos para prellenar y poder restaurar si cancelan
    setEditState({ id: b.id, type: b.type, payload: b.payload, createdAt: b.createdAt });
    // 3) abrimos el formulario correspondiente y subimos
    setAccion(b.type);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Guardar (upsert): si hay edición, reinsertamos con el mismo id; si no, creamos nuevo
  const upsertBloque = (type: Block["type"], payload: any) => {
    if (editState && editState.type === type) {
      agregarBloque({
        id: editState.id,
        type,
        createdAt: new Date().toISOString(),
        payload,
      });
      setEditState(null);
    } else {
      agregarBloque({
        id: uid(),
        type,
        createdAt: new Date().toISOString(),
        payload,
      });
    }
    setAccion(null);
  };

  // Cancelar: si estábamos editando, restauramos el bloque original
  const cancelAndRestore = () => {
    if (editState) {
      agregarBloque({
        id: editState.id,
        type: editState.type,
        createdAt: editState.createdAt,
        payload: editState.payload,
      });
      setEditState(null);
    }
    setAccion(null);
  };

  // Vitals iniciales para Dx (desde cache/endpoint)
  const { lastByDni } = useVitalSignsCache([dni]);
  const vs = dni ? lastByDni[dni] : undefined;
  const initialSignos = vs
    ? {
        temperatura: vs.temperatura,
        f_card: vs.f_card,
        f_resp: vs.f_resp,
        talla: vs.talla,
        peso: vs.peso,
      }
    : undefined;

  return (
    <section className="col-span-1 h-full">
      <div className="bg-white rounded-3xl ring-1 ring-slate-200 shadow p-6 h-full flex flex-col">
        <div className="shrink-0" ref={topRef}>
          <h2 className="text-slate-700 font-bold text-lg mb-2">Área de trabajo</h2>
          <p className="text-sm text-slate-500 mb-3">
            Selecciona una opción del sidebar para ingresar datos. Al confirmar, se registra en el historial y se envía para predicción.
          </p>
        </div>

        <div className="min-h-0 grow overflow-y-auto">
          {!accion && (
            <div className="rounded-xl border border-dashed border-slate-300 p-4 text-slate-500">
              No hay una herramienta activa. Elige “Receta”, “Indicaciones”, “Dx” o “Notas”.
            </div>
          )}

          {/* === RECETA === */}
          {accion === "receta" && (
            <FormReceta
              initialMedicamentos={editState?.type === "receta" ? editState.payload?.medicamentos ?? [] : []}
              initialIndicaciones={editState?.type === "receta" ? editState.payload?.indicaciones ?? "" : ""}
              onCancel={cancelAndRestore}
              onSave={(medicamentos, indicaciones) => upsertBloque("receta", { medicamentos, indicaciones })}
            />
          )}

          {/* === INDICACIONES === */}
          {accion === "indicaciones" && (
            <FormIndicaciones
              initialIndicaciones={editState?.type === "indicaciones" ? editState.payload?.indicaciones ?? "" : ""}
              onCancel={cancelAndRestore}
              onSave={(indicaciones) => upsertBloque("indicaciones", { indicaciones })}
            />
          )}

          {/* === DIAGNÓSTICO PRELIMINAR === */}
          {accion === "diagnostico" && (
            <>
              {/* Banner de error inline */}
              {diagError && (
                <div className="mb-3 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                  {diagError}
                </div>
              )}

              <DiagnosticoPreliminarPanel
                initialSignos={initialSignos}
                initialMotivo={editState?.type === "diagnostico" ? editState.payload?.motivo ?? "" : ""}
                initialExamen={editState?.type === "diagnostico" ? editState.payload?.examen ?? "" : ""}
                onConfirm={({ motivo, examen, signos }) => {
                  // 🔎 Validación: texto fuera de dominio (GI, GU, trauma, etc.)
                  const outOfDomain = isOutOfDomain(motivo, examen);

                  if (outOfDomain) {
                    setDiagError(
                      "El texto ingresado sugiere un motivo NO respiratorio, por lo que está fuera del alcance del modelo. Ajusta el motivo/examen."
                    );
                    // No guardamos el bloque
                    return;
                  }

                  // limpiar error y guardar
                  setDiagError(null);
                  upsertBloque("diagnostico", {
                    motivo,
                    examen,
                    signos,
                    flags: { out_of_domain: false },
                  });
                }}
              />
            </>
          )}

          {/* === NOTAS === */}
          {accion === "notas" && (
            <FormNotas
              initialNotas={editState?.type === "notas" ? editState.payload?.notas ?? "" : ""}
              onCancel={cancelAndRestore}
              onSave={(notas) => upsertBloque("notas", { notas })}
            />
          )}

          {/* Lista de bloques (ya NO incluye el que se está editando porque lo removimos) */}
          {bloques.length > 0 && (
            <div className="mt-6">
              <h3 className="text-slate-700 font-semibold mb-2">Bloques del caso</h3>
              <div className="max-h-[48vh] overflow-y-auto pr-1 space-y-3">
                {bloques.map((b) => (
                  <BlockCard
                    key={b.id}
                    block={b}
                    onDelete={() => eliminarBloque(b.id)}
                    onEdit={() => handleEdit(b)} // botón ✎ en la tarjeta
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2 lg:hidden shrink-0">
          <button
            className={`h-11 w-11 rounded-full grid place-content-center ring-1
              ${
                bloques.length === 0
                  ? "text-emerald-400 bg-emerald-50 ring-emerald-100 opacity-60"
                  : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100 ring-emerald-200"
              }`}
            title="Confirmar"
            onClick={registrarConsultaDesdeBloques}
            disabled={bloques.length === 0}
          >
            ✓
          </button>
          <button
            className="h-11 w-11 rounded-full grid place-content-center text-red-700 bg-red-50 hover:bg-red-100 ring-1 ring-red-200"
            title="Descartar"
            onClick={() => {
              // el contenedor/página maneja limpiar via sidebar
            }}
          >
            ×
          </button>
        </div>
      </div>
    </section>
  );
}
