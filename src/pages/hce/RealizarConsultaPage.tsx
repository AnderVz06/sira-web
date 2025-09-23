import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { FiArrowLeft, FiPlus, FiFileText } from "react-icons/fi";
import { HiOutlineDocumentReport, HiOutlineDocumentSearch } from "react-icons/hi";
import { useMemo, useState } from "react";

import { useBloques } from "@/hooks/history/useBloques";
import { useHistorialByDni } from "@/hooks/history/useHistorialByDni";

import { initials } from "@/utils/format";
import { buildConsolidadoFromBloques } from "@/utils/consolidarConsulta";

import HistorialList from "@/components/Historial/HistorialList";
import AreaTrabajo from "@/components/AreaTrabajo/AreaTrabajo";
import SidebarAcciones from "@/components/AreaTrabajo/SidebarAcciones";
import IconAction from "@/components/common/IconAction";
import ConfirmacionConsultaModal from "@/components/Historial/ConfirmacionConsultaModal";

import predictFromDni, { type PredictRequest } from "@/service/predict/predictFromDni";
import type { HistorialItem } from "@/types/history";
import EmptyState from "@/components/common/EmptyState";

type PredictResponse = {
  resultado_diagnostico?: string;
  diagnostico?: string;
  diagnosis?: string;
  prediccion?: string;
  prediction?: string;
  [k: string]: any;
};

export default function RealizarConsultaPage() {
  const { dni } = useParams();
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const consultaIdStr = sp.get("consulta_id");
  const consultaId = consultaIdStr ? Number(consultaIdStr) : undefined;

  const { accion, setAccion, bloques, agregarBloque, eliminarBloque, limpiarBloques } = useBloques();
  const { historial, pacienteHeader, loading, error, reload } = useHistorialByDni(dni);

  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<Partial<HistorialItem> | null>(null);
  const [apiDiagnosis, setApiDiagnosis] = useState<string | undefined>(undefined); // <-- NUEVO

  const ultima: HistorialItem | undefined = historial[0];

  const usedTools = useMemo(
    () => new Set(bloques.map((b) => b.type as "receta" | "indicaciones" | "diagnostico" | "notas")),
    [bloques]
  );

  const extractDiagnosis = (resp: PredictResponse | unknown): string | undefined => {
    if (!resp || typeof resp !== "object") return undefined;
    const r = resp as PredictResponse;
    return (
      r.resultado_diagnostico ||
      r.diagnostico ||
      r.diagnosis ||
      r.prediccion ||
      r.prediction
    )?.toString();
  };

  const doConfirmAndPredict = async (consolidado: Partial<HistorialItem>) => {
    if (!dni) return;

    if (!Number.isFinite(consultaId)) {
      alert("Falta consulta_id válido en la URL");
      return;
    }
    setSubmitting(true);
    try {
      const payload: PredictRequest = {
        motivo_consulta: consolidado.motivo_consulta ?? "",
        examenfisico: consolidado.examenfisico ?? "",
        indicaciones: consolidado.indicaciones ?? "",
        medicamentos: consolidado.medicamentos ?? "",
        notas: consolidado.notas ?? "",
      };

      const resp = await predictFromDni(dni, payload, { consultaId });
      const dx = extractDiagnosis(resp as any);     // <-- obtiene diagnóstico de la API
      setApiDiagnosis(dx);                   // <-- guarda diagnóstico de API
      console.debug("[/predict/from-dni] sent:", payload, "resp:", resp);

      // mostrar modal con la consulta consolidada
      setModalData(consolidado);
      setModalOpen(true);

      // limpiar constructor
      limpiarBloques();
      setAccion(null);
    } catch (e: any) {
      console.error("Error al enviar predicción:", e);
      alert("Error al enviar predicción: " + (e?.message || "desconocido"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6 text-slate-600">Cargando…</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!dni) return <div className="p-6 text-slate-600">DNI no proporcionado.</div>;

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 via-slate-50 to-white relative">
      {/* Overlay de envío */}
      {submitting && (
        <div className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm grid place-content-center">
          <div className="rounded-2xl bg-white px-6 py-4 ring-1 ring-slate-200 shadow">
            <div className="animate-pulse text-slate-700">Enviando consulta…</div>
          </div>
        </div>
      )}

      <div className="flex-1 pl-[5px] flex">
        <div className="w-full min-h-screen bg-white/80 backdrop-blur-sm rounded-3xl shadow ring-1 ring-slate-200 flex flex-col overflow-hidden">
          {/* HERO */}
          <header className="px-6 md:px-10 pt-6 pb-2">
            <div className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-500 p-6 flex items-center gap-4 shadow-lg ring-1 ring-white/20">
              <button
                onClick={() => navigate(-1)}
                className="h-10 w-10 rounded-xl bg-white/20 text-white grid place-content-center hover:bg-white/25"
                title="Volver"
              >
                <FiArrowLeft />
              </button>
              <div className="h-12 w-12 rounded-xl bg-white text-blue-700 font-extrabold grid place-content-center shadow">
                {initials(pacienteHeader?.nombre || "P", pacienteHeader?.apellido || "")}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-extrabold text-white truncate">
                  {pacienteHeader?.nombre} {pacienteHeader?.apellido}
                </h1>
                <p className="text-blue-100 text-sm">
                  DNI: {pacienteHeader?.dni} • {historial.length} {historial.length === 1 ? "consulta" : "consultas"}
                </p>
              </div>

              {/* Acciones compactas en móvil */}
              <div className="flex items-center gap-2 lg:hidden">
                <IconAction label="Receta" icon={<FiFileText size={18} />} onClick={() => setAccion("receta")} />
                <IconAction label="Indicaciones" icon={<HiOutlineDocumentSearch size={18} />} onClick={() => setAccion("indicaciones")} />
                <IconAction label="Dx" icon={<HiOutlineDocumentReport size={18} />} onClick={() => setAccion("diagnostico")} />
                <button
                  className="h-11 w-11 rounded-full bg-white text-blue-700 font-semibold shadow hover:shadow-md grid place-content-center"
                  title="Nueva consulta"
                  onClick={() => setAccion("diagnostico")}
                >
                  <FiPlus />
                </button>
              </div>
            </div>
          </header>

          {/* MAIN */}
          <main className="grid grid-cols-[1.2fr_1fr_96px] items-stretch gap-6 p-6 md:p-10 pt-0 -mt-2 md:-mt-4 overflow-y-auto">
            {historial.length > 0 ? (
              <HistorialList historial={historial} />
            ) : (
              <section className="h-full col-span-1">
                <div className="h-full">
                  <div className="w-full min-h-[50vh] md:min-h-[82vh] rounded-3xl bg-white/80 backdrop-blur-sm ring-1 ring-slate-200 shadow p-6 md:p-10 grid place-items-center">
                    <div className="w-full max-w-3xl">
                      <EmptyState
                        title="Sin consultas previas"
                        desc="Este paciente aún no tiene atenciones registradas."
                        actionLabel="Nueva consulta"
                        onAction={() => setAccion("diagnostico")}
                      />
                    </div>
                  </div>
                </div>
              </section>
            )}

            <AreaTrabajo
              dni={dni}
              accion={accion}
              setAccion={setAccion}
              bloques={bloques}
              agregarBloque={agregarBloque}
              eliminarBloque={eliminarBloque}
              ultima={ultima}
              onConfirmConsulta={doConfirmAndPredict}
            />

            <SidebarAcciones
              accion={accion}
              setAccion={setAccion}
              canConfirm={bloques.length > 0 && !submitting}
              onConfirm={() => {
                const consolidado = buildConsolidadoFromBloques(bloques, ultima);
                void doConfirmAndPredict(consolidado);
              }}
              onDiscard={() => {
                limpiarBloques();
                setAccion(null);
              }}
              onNuevaConsulta={() => setAccion("diagnostico")}
              usedTools={usedTools}
            />
          </main>
        </div>
      </div>

      {/* Modal post-confirmación */}
      <ConfirmacionConsultaModal
        open={modalOpen}
        data={modalData}
        diagnosticoApi={apiDiagnosis}
        onClose={() => {
          // "Volver a consulta" -> /consultas-medico
          setModalOpen(false);
          navigate("/consultas-medico");
        }}
        onVerHCE={() => {
          // "Ver HCE" -> /historia-clinica/:dni
          setModalOpen(false);
          if (dni) {
            navigate(`/historia-clinica/${dni}`);
          } else {
            navigate("/historia-clinica"); // fallback si no hay dni
          }
        }}
      />
    </div>
  );
}
