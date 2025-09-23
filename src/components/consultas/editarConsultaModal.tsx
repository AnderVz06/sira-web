// src/components/consultas/EditarConsultaModal.tsx
import { Fragment, useEffect, useState, type ReactNode } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  HiOutlinePencilAlt,
  HiOutlineX,
  HiOutlineDocumentReport,
  HiOutlineRefresh,
  HiOutlineExclamationCircle,
  HiOutlineCheck,
  HiOutlineCheckCircle,
} from "react-icons/hi";
import { useLastPredictByDni, type PredictRecord } from "@/hooks/history/useLastPredictByDni";
import { useUpdatePredictByDni, type UpdatePredictPayload } from "@/hooks/history/useUpdatePredictByDni";
import { isOutOfDomain } from "@/utils/non_respitatory";

export default function EditarConsultaModal({
  open,
  onClose,
  dni,
  diagnosticoApi,
}: {
  open: boolean;
  onClose: () => void;
  dni: string | null;
  diagnosticoApi?: string;
}) {
  const { data, loading, error, reload } = useLastPredictByDni(dni ?? undefined);
  const { update, loading: saving, error: saveError } = useUpdatePredictByDni();

  // Campos de texto editables
  const [form, setForm] = useState<Partial<PredictRecord>>({});
  const [touched, setTouched] = useState(true);

  // Error de dominio para motivo/examen
  const [diagError, setDiagError] = useState<string | null>(null);

  // Diagnóstico (siempre badge “Sugerido por IA”)
  const dxFinal =
    (diagnosticoApi && diagnosticoApi.trim()) ||
    (data?.resultado && data.resultado.trim()) ||
    "—";

  // Modal de éxito
  const [successOpen, setSuccessOpen] = useState(false);
  const [successDx, setSuccessDx] = useState<string>("");

  useEffect(() => {
    if (!open) return;
    if (data) {
      const { motivo_consulta, examenfisico, indicaciones, medicamentos, notas } = data;
      setForm({ motivo_consulta, examenfisico, indicaciones, medicamentos, notas });
      setTouched(false);
      setDiagError(null);
    } else if (!loading) {
      setForm({});
      setTouched(false);
      setDiagError(null);
    }
  }, [open, data, loading]);

  function up<K extends keyof PredictRecord>(key: K, value: PredictRecord[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setTouched(true);
    if (key === "motivo_consulta" || key === "examenfisico") {
      const nextMotivo = key === "motivo_consulta" ? (value as string) : (form.motivo_consulta ?? "");
      const nextExamen = key === "examenfisico" ? (value as string) : (form.examenfisico ?? "");
      setDiagError(
        isOutOfDomain(nextMotivo, nextExamen)
          ? "El motivo o el examen sugieren un cuadro NO respiratorio. Ajusta el texto para continuar."
          : null
      );
    }
  }

  async function handleSave() {
    if (!dni) return;
    const motivo = form.motivo_consulta ?? "";
    const examen = form.examenfisico ?? "";
    if (isOutOfDomain(motivo, examen)) {
      setDiagError("El motivo o el examen sugieren un cuadro NO respiratorio. Ajusta el texto para continuar.");
      return;
    }

    const body: UpdatePredictPayload = {
      motivo_consulta: form.motivo_consulta ?? "",
      examenfisico: form.examenfisico ?? "",
      indicaciones: form.indicaciones ?? "",
      medicamentos: form.medicamentos ?? "",
      notas: form.notas ?? "",
    };

    try {
      const updated = await update(dni, body);
      void reload();
      setTouched(false);

      const nextDx = (updated?.resultado && updated.resultado.trim()) || dxFinal;
      setSuccessDx(nextDx || "—");
      setSuccessOpen(true);
    } catch {
      // el banner con saveError ya se muestra abajo
    }
  }

  const loadError = error ?? undefined;
  const motivoOut = isOutOfDomain(form.motivo_consulta ?? "", form.examenfisico ?? "");
  const examenOut = motivoOut;

  return (
    <>
      {/* Modal de edición */}
      <Transition show={open} as={Fragment}>
        <Dialog onClose={(_v) => onClose()} className="relative z-50">
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
                  {/* Header compacto */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 text-white">
                    <div className="flex items-center justify-between">
                      <Dialog.Title className="flex items-center gap-2 text-base sm:text-lg font-extrabold leading-tight">
                        <span className="grid h-9 w-9 place-content-center rounded-xl bg-white text-emerald-600 shadow">
                          <HiOutlinePencilAlt size={18} />
                        </span>
                        <span>Editar consulta</span>
                      </Dialog.Title>
                      <button
                        onClick={onClose}
                        className="h-9 w-9 grid place-content-center rounded-lg bg-white/15 text-white hover:bg-white/25"
                        title="Cerrar"
                      >
                        <HiOutlineX />
                      </button>
                    </div>
                    <p className="mt-1 text-blue-100 text-[11px]">
                      Edita solo lo necesario. Los cambios se guardan al confirmar.
                    </p>
                  </div>

                  {/* Contenido con scroll interno */}
                  <div className="max-h-[80vh] overflow-y-auto px-5 py-4 space-y-4">
                    {/* Estados */}
                    {loading && (
                      <Banner>
                        <HiOutlineRefresh className="animate-spin" />
                        <span>Cargando datos por DNI…</span>
                      </Banner>
                    )}
                    {!!loadError && (
                      <Banner tone="error">
                        <HiOutlineExclamationCircle />
                        <span className="truncate">
                          Ocurrió un error al obtener los datos: <b>{loadError}</b>
                        </span>
                        <button className="underline ml-auto" onClick={() => reload()}>
                          Reintentar
                        </button>
                      </Banner>
                    )}
                    {!!diagError && (
                      <Banner tone="error">
                        <HiOutlineExclamationCircle />
                        <span className="truncate">{diagError}</span>
                      </Banner>
                    )}
                    {!!saveError && (
                      <Banner tone="error">
                        <HiOutlineExclamationCircle />
                        <span className="truncate">
                          No se pudo guardar: <b>{saveError}</b>
                        </span>
                      </Banner>
                    )}

                    {/* Diagnóstico (no editable) */}
                    <div className="rounded-xl ring-1 ring-blue-200 bg-gradient-to-br from-blue-50 to-white p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide text-blue-700">
                          <HiOutlineDocumentReport className="opacity-80" />
                          <span>Diagnóstico / Resultado</span>
                        </div>
                        <span
                          className="inline-flex items-center gap-2 rounded-full px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold ring-1 bg-indigo-50 text-indigo-800 ring-indigo-200"
                          title="Generado por el servicio de IA"
                        >
                          <span className="h-2 w-2 rounded-full bg-current opacity-60" />
                          Sugerido por IA
                        </span>
                      </div>
                      <div className="mt-1.5 text-blue-900 text-xl sm:text-2xl font-extrabold leading-snug break-words">
                        {dxFinal}
                      </div>
                    </div>

                    {/* Bloques editables */}
                    <EditableBlock
                      label="Motivo de consulta"
                      value={form.motivo_consulta}
                      onChange={(v) => up("motivo_consulta", v as PredictRecord["motivo_consulta"])}
                      invalid={motivoOut}
                      hint={motivoOut ? "Texto detectado como fuera del dominio respiratorio." : undefined}
                    />
                    <EditableBlock
                      label="Examen físico"
                      value={form.examenfisico}
                      onChange={(v) => up("examenfisico", v as PredictRecord["examenfisico"])}
                      invalid={examenOut}
                      hint={examenOut ? "Texto detectado como fuera del dominio respiratorio." : undefined}
                    />
                    <EditableBlock
                      label="Indicaciones"
                      value={form.indicaciones}
                      onChange={(v) => up("indicaciones", v as PredictRecord["indicaciones"])}
                    />
                    <EditableBlock
                      label="Medicamentos"
                      value={form.medicamentos}
                      onChange={(v) => up("medicamentos", v as PredictRecord["medicamentos"])}
                    />
                    <EditableBlock
                      label="Notas"
                      value={form.notas}
                      onChange={(v) => up("notas", v as PredictRecord["notas"])}
                    />
                  </div>

                  {/* Footer fijo */}
                  <div className="sticky bottom-0 z-10 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-t border-slate-200 px-5 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[11px] text-slate-500">
                        {touched ? "Tienes cambios sin guardar" : "Sin cambios"}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={onClose}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                        >
                          Volver
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={saving || loading || !touched}
                          className="rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saving ? "Guardando…" : "Guardar cambios"}
                        </button>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Modal de éxito */}
      <SuccessDialog
        open={successOpen}
        dx={successDx}
        onClose={() => {
          setSuccessOpen(false);
          onClose(); // cierra el modal principal al volver
        }}
      />
    </>
  );
}

/* ---------- Subcomponentes ---------- */

function Banner({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "error";
}) {
  const styles =
    tone === "error"
      ? "border-red-200 bg-red-50 text-red-800"
      : "border-slate-200 bg-slate-50 text-slate-600";
  return (
    <div className={`rounded-lg border p-3 text-sm flex items-center gap-2 ${styles}`}>
      {children}
    </div>
  );
}

function EditableBlock({
  label,
  value,
  onChange,
  maxRows = 8,
  invalid,
  hint,
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  maxRows?: number;
  invalid?: boolean;
  hint?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");

  useEffect(() => {
    if (!editing) setDraft(value ?? "");
  }, [value, editing]);

  const commit = () => {
    onChange(draft);
    setEditing(false);
  };
  const cancel = () => {
    setDraft(value ?? "");
    setEditing(false);
  };

  return (
    <div
      className={[
        "bg-white rounded-xl p-4 ring-1",
        invalid ? "ring-rose-300" : "ring-slate-200",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-xs font-semibold text-slate-500">{label}</div>

        {!editing ? (
          <button
            className={[
              "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium ring-1",
              invalid
                ? "ring-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100"
                : "ring-slate-200 text-slate-600 hover:bg-slate-50",
            ].join(" ")}
            onClick={() => setEditing(true)}
            title="Editar"
          >
            <HiOutlinePencilAlt className="h-4 w-4" />
            Editar
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold ring-1 ring-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
              onClick={commit}
              title="Guardar"
            >
              <HiOutlineCheck className="h-4 w-4" />
              Guardar
            </button>
            <button
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold ring-1 ring-slate-200 text-slate-600 bg-white hover:bg-slate-50"
              onClick={cancel}
              title="Cancelar"
            >
              <HiOutlineX className="h-4 w-4" />
              Cancelar
            </button>
          </div>
        )}
      </div>

      {!editing ? (
        <>
          <div className="mt-2 text-sm text-slate-800 whitespace-pre-wrap min-h-[1rem]">
            {value?.trim() ? value : "—"}
          </div>
          {invalid && hint ? (
            <div className="mt-2 text-[11px] text-rose-700">{hint}</div>
          ) : null}
        </>
      ) : (
        <AutoTextarea value={draft} onChange={setDraft} maxRows={maxRows} placeholder="—" />
      )}
    </div>
  );
}

function AutoTextarea({
  value,
  onChange,
  placeholder,
  maxRows = 8,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxRows?: number;
}) {
  const [rows, setRows] = useState(3);

  useEffect(() => {
    const lines = Math.min(maxRows, Math.max(3, value.split(/\n/).length));
    setRows(lines);
  }, [value, maxRows]);

  return (
    <textarea
      className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 whitespace-pre-wrap"
      rows={rows}
      style={{ maxHeight: `${maxRows * 1.75}rem` }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

function SuccessDialog({
  open,
  dx,
  onClose,
}: {
  open: boolean;
  dx: string;
  onClose: () => void;
}) {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={(_v) => onClose()} className="relative z-[60]">
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
              <Dialog.Panel className="w-full max-w-md overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 shadow-2xl">
                <div className="px-6 py-5">
                  {/* Header del modal */}
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-content-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
                      <HiOutlineCheckCircle size={22} />
                    </span>
                    <Dialog.Title className="text-lg font-extrabold text-slate-900">
                      Consulta actualizada
                    </Dialog.Title>
                  </div>

                  {/* Bloque igual al “Sugerido por IA” */}
                  <div className="mt-4 rounded-xl ring-1 ring-blue-200 bg-gradient-to-br from-blue-50 to-white p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide text-blue-700">
                        {/* mismo look & feel de cabecera */}
                        <span className="inline-flex items-center gap-2">
                          {/* opcional: puedes usar HiOutlineDocumentReport si quieres */}
                          Nuevo diagnóstico / Resultado
                        </span>
                      </div>
                      <span
                        className="inline-flex items-center gap-2 rounded-full px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold ring-1 bg-indigo-50 text-indigo-800 ring-indigo-200"
                        title="Generado por el servicio de IA"
                      >
                        <span className="h-2 w-2 rounded-full bg-current opacity-60" />
                        Sugerido por IA
                      </span>
                    </div>

                    <div className="mt-1.5 text-blue-900 text-xl font-extrabold leading-snug break-words">
                      {dx}
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={onClose}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      Volver
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

