import { useState } from "react";
import type { Status, ConsultaPayload } from "@/types/consultation";
import SelectMedico from "@/components/consultas/SelectMedico";
import SelectPaciente from "@/components/consultas/SelectPaciente";

// ── CAMBIO: ya no necesitamos STATUS_LIST ni toBackendStatus
const DEFAULT_STATUS: Status = "En espera";

export default function CreateConsultaModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (payload: ConsultaPayload) => Promise<void> | void;
}) {
  const [dni, setDni] = useState("");
  const [medico, setMedico] = useState(""); // user_fullname

  // Día del mes (para el mes actual)
  const [dia, setDia] = useState<number | "">(new Date().getDate());
  const [hora, setHora] = useState<number | "">("");
  const [minuto, setMinuto] = useState<number | "">("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    setErr("");

    if (!dni.trim() || !medico.trim() || dia === "" || hora === "" || minuto === "") {
      setErr("Completa DNI, médico, día, hora y minuto.");
      return;
    }

    if (!/^\d{6,12}$/.test(dni.trim())) {
      setErr("Ingresa un DNI válido (6–12 dígitos).");
      return;
    }

    // Rango básico
    if (typeof dia === "number" && (dia < 1 || dia > 31)) {
      setErr("El día debe estar entre 1 y 31.");
      return;
    }
    if (typeof hora === "number" && (hora < 0 || hora > 23)) {
      setErr("La hora debe estar entre 0 y 23.");
      return;
    }
    if (typeof minuto === "number" && (minuto < 0 || minuto > 59)) {
      setErr("El minuto debe estar entre 0 y 59.");
      return;
    }

    const payload: ConsultaPayload = {
      status: DEFAULT_STATUS, // ── CAMBIO: siempre "En espera"
      dni: dni.trim(),
      user_fullname_medic: medico.trim(),
      dia: Number(dia),
      hora: Number(hora),
      minuto: Number(minuto),
    };

    try {
      setLoading(true);
      await onSuccess(payload);
      onClose();
    } catch (e: any) {
      setErr(e?.response?.data?.detail || e?.message || "No se pudo crear la consulta");
    } finally {
      setLoading(false);
    }
  };

  // Guardar con Enter
  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void submit();
    }
  };

  const hasHorario = dia !== "" && hora !== "" && minuto !== "";
  const preview =
    hasHorario ? `Se agenda para el día ${dia} del mes actual a las ${pad(hora)}:${pad(minuto)}.` : "";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 backdrop-blur-[1px] p-4">
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200"
        onKeyDown={onKeyDown}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white">
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-white text-blue-700 grid place-content-center font-extrabold shadow">
              NC
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-extrabold leading-tight truncate">
                Nueva consulta (hoy)
              </h3>
              <p className="text-blue-100 text-xs">
                Programa para el <span className="font-semibold text-white/95">mes actual</span>.
              </p>
              {/* ── CAMBIO: mostramos estado fijo (opcional) */}
              <p className="text-blue-100 text-xs">Estado: <span className="text-white/95">En espera</span></p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {err && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {err}
            </div>
          )}

          {/* Paciente */}
          <fieldset className="rounded-xl ring-1 ring-slate-200 bg-gradient-to-br from-slate-50 to-white px-4 py-3">
            <legend className="px-1 text-sm font-semibold text-slate-800">Paciente</legend>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SelectPaciente
                dni={dni}
                onChangeDni={setDni}
                onChangeNombre={(name) => {
                  // si quieres guardar el nombre en algún estado paralelo
                  // setNombrePaciente(name)
                }}
              />
              <SelectMedico
                value={medico}
                onChange={setMedico}
              />
            </div>
          </fieldset>

          {/* Programación */}
          <fieldset className="rounded-xl ring-1 ring-slate-200 bg-gradient-to-br from-slate-50 to-white px-4 py-3">
            <legend className="px-1 text-sm font-semibold text-slate-800">Programación</legend>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* ── (Opcional) dejamos solo día/hora/minuto */}
              <LabeledInput
                label="Día del mes"
                type="number"
                min="1"
                max="31"
                placeholder="1–31"
                value={dia === "" ? "" : String(dia)}
                onChange={(v) => setDia(v === "" ? "" : Number(v))}
                inputMode="numeric"
              />
              <LabeledInput
                label="Hora"
                type="number"
                min="0"
                max="23"
                placeholder="0–23"
                value={hora === "" ? "" : String(hora)}
                onChange={(v) => setHora(v === "" ? "" : Number(v))}
                inputMode="numeric"
              />
              <LabeledInput
                label="Minuto"
                type="number"
                min="0"
                max="59"
                placeholder="0–59"
                value={minuto === "" ? "" : String(minuto)}
                onChange={(v) => setMinuto(v === "" ? "" : Number(v))}
                inputMode="numeric"
              />
            </div>

            {/* Preview del horario */}
            <div className="mt-2 text-xs text-slate-600 min-h-[1rem]">
              {preview}
            </div>
          </fieldset>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={submit}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Guardando…" : "Crear consulta"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- UI helpers ---------- */

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  min,
  max,
  inputMode,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
  min?: string;
  max?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoFocus?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-700">{label}</span>
      <div className="flex items-center gap-2 rounded-xl ring-1 ring-slate-200 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500/60 shadow-sm">
        <input
          className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none"
          type={type}
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          autoFocus={autoFocus}
        />
      </div>
    </label>
  );
}

/* Utilitario para mostrar 2 dígitos */
function pad(v: number | ""): string {
  if (v === "") return "--";
  const n = Number(v);
  return Number.isFinite(n) ? String(n).padStart(2, "0") : "--";
}
