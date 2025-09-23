import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  HiOutlineCheckCircle,
  HiOutlineDocumentReport,
  HiOutlineX,
} from "react-icons/hi";
import type { HistorialItem } from "@/types/history";
import { formatearFecha } from "@/utils/dates";

export default function ConfirmacionConsultaModal({
  open,
  onClose,
  data,
  onVerHCE,
  diagnosticoApi, // diagnóstico que viene de la API (opcional)
}: {
  open: boolean;
  onClose: () => void;
  data: Partial<HistorialItem> | null;
  onVerHCE: () => void;
  diagnosticoApi?: string;
}) {
  // Diagnóstico final a mostrar (prioriza API)
  const dxFromApi = Boolean(diagnosticoApi && diagnosticoApi.trim());
  const dxFinal =
    (diagnosticoApi && diagnosticoApi.trim()) ||
    (data?.resultado_diagnostico && data.resultado_diagnostico.trim()) ||
    "—";

  const fecha = data?.fecha_registro ? formatearFecha(data.fecha_registro) : "—";

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        {/* Overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-150"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" />
        </Transition.Child>

        {/* Panel */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-150"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="ease-in duration-100"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Dialog.Panel className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 shadow-2xl">
                {/* Header con gradiente */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white">
                  <div className="flex items-start justify-between gap-4">
                    <Dialog.Title className="flex items-center gap-2 text-lg font-extrabold leading-tight">
                      <span className="grid h-10 w-10 place-content-center rounded-xl bg-white text-emerald-600 shadow">
                        <HiOutlineCheckCircle size={20} />
                      </span>
                      <span>Consulta registrada</span>
                    </Dialog.Title>
                    <button
                      onClick={onClose}
                      className="h-9 w-9 grid place-content-center rounded-lg bg-white/15 text-white hover:bg-white/25"
                      title="Cerrar"
                    >
                      <HiOutlineX />
                    </button>
                  </div>
                  <p className="mt-1 text-blue-100 text-xs">
                    Revisa el resumen antes de continuar.
                  </p>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4">
                  {/* Diagnóstico destacado */}
                  <div className="rounded-2xl ring-1 ring-blue-200 bg-gradient-to-br from-blue-50 to-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-blue-700">
                        <HiOutlineDocumentReport className="opacity-80" />
                        <span>Resultado preliminar</span>
                      </div>

                      {/* Origen del diagnóstico */}
                      <span
                        className={[
                          "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold ring-1",
                          dxFromApi
                            ? "bg-indigo-50 text-indigo-800 ring-indigo-200"
                            : "bg-emerald-50 text-emerald-800 ring-emerald-200",
                        ].join(" ")}
                        title={dxFromApi ? "Generado por el servicio de IA" : "Registrado en el formulario"}
                      >
                        <span className="h-2.5 w-2.5 rounded-full bg-current opacity-60" />
                        {dxFromApi ? "Sugerido por IA" : "Del médico"}
                      </span>
                    </div>

                    <div className="mt-2 text-blue-900 text-2xl font-extrabold leading-snug break-words">
                      {dxFinal}
                    </div>
                  </div>

                  {/* Resumen principal */}
                  <div className="rounded-xl ring-1 ring-slate-200 bg-slate-50/60 p-4">
                    <div className="flex flex-wrap items-center gap-3 text-slate-700 text-sm">
                      <div className="inline-flex items-center gap-2">
                        <HiOutlineDocumentReport />
                        <span>
                          <strong>Fecha:</strong> {fecha}
                        </span>
                      </div>
                    </div>

                    {/* Vitals */}
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2 text-sm">
                      <Chip label="Temp" value={fmt(data?.temperatura, "°C")} />
                      <Chip label="FC" value={fmt(data?.f_card, "bpm")} />
                      <Chip label="FR" value={fmt(data?.f_resp, "rpm")} />
                      <Chip label="Talla" value={fmt(data?.talla, "m")} />
                      <Chip label="Peso" value={fmt(data?.peso, "kg")} />
                    </div>
                  </div>

                  {/* Bloques de texto */}
                  <Info label="Motivo de consulta" value={data?.motivo_consulta} />
                  <Info label="Examen físico" value={data?.examenfisico} />
                  {data?.indicaciones ? (
                    <Info label="Indicaciones" value={data.indicaciones} />
                  ) : null}
                  {data?.medicamentos ? (
                    <Info label="Medicamentos" value={data.medicamentos} />
                  ) : null}
                  {data?.notas ? <Info label="Notas" value={data.notas} /> : null}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 flex items-center justify-end gap-2">
                  <button
                    onClick={onClose}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Volver a consulta
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

/* -------- Subcomponentes -------- */

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div className="bg-white rounded-xl ring-1 ring-slate-200 p-4">
      <div className="text-xs font-semibold text-slate-500">{label}</div>
      <div className="text-sm text-slate-800 whitespace-pre-wrap">
        {value?.trim() ? value : "—"}
      </div>
    </div>
  );
}

function Chip({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="px-3 py-2 rounded-xl text-center ring-1 bg-gradient-to-br from-slate-50 to-white text-slate-800 ring-slate-200">
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

function fmt(v?: number, suf?: string) {
  return v == null || !Number.isFinite(v) ? "—" : `${v}${suf ? ` ${suf}` : ""}`;
}
