import { useMemo, useState } from "react";
import type { VitalSignPayload } from "@/types/vitalsign";

export default function AgregarSignosModal({
  dni,
  edad,
  genero,
  onClose,
  onSuccess,
}: {
  dni: string;
  edad: number;
  genero: "m" | "f";
  onClose: () => void;
  onSuccess: (payload: VitalSignPayload) => void | Promise<void>;
}) {
  // Strings para permitir vacío
  const [temperatura, setTemperatura] = useState<string>("");
  const [f_card, setFCard] = useState<string>("");
  const [f_resp, setFResp] = useState<string>("");
  const [talla, setTalla] = useState<string>("");
  const [peso, setPeso] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // IMC y su categoría visual
  const imc = useMemo(() => {
    const t = parseFloat(talla);
    const p = parseFloat(peso);
    if (!Number.isFinite(t) || !Number.isFinite(p) || t <= 0) return null;
    return p / (t * t);
  }, [talla, peso]);

  const imcChip = getImcChip(imc);

  const submit = async () => {
    setErr("");

    const t = parseFloat(temperatura);
    const fc = parseFloat(f_card);
    const fr = parseFloat(f_resp);
    const ta = parseFloat(talla);
    const pe = parseFloat(peso);

    if (![t, fc, fr, ta, pe].every((v) => Number.isFinite(v))) {
      setErr("Completa todos los campos con valores numéricos válidos.");
      return;
    }
    if (ta <= 0 || pe <= 0) {
      setErr("Talla y peso deben ser mayores a 0.");
      return;
    }

    const payload: VitalSignPayload = {
      dni,
      temperatura: t,
      f_card: fc,
      f_resp: fr,
      talla: ta,
      peso: pe,
    };

    try {
      setLoading(true);
      await onSuccess(payload);
      onClose();
    } catch (e: any) {
      setErr(e?.message || "No se pudo registrar signos vitales");
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

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 backdrop-blur-[1px] p-4">
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200"
        onKeyDown={onKeyDown}
      >
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white">
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-white text-blue-700 grid place-content-center font-extrabold shadow">
              {genero === "m" ? "M" : "F"}
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-extrabold leading-tight truncate">
                Registrar signos vitales
              </h3>
              <p className="text-blue-100 text-xs">
                DNI: <span className="font-semibold text-white/95">{dni}</span> · Edad {edad} ·{" "}
                {genero === "m" ? "Masculino" : "Femenino"}
              </p>
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

          {/* Tarjeta: Signos vitales */}
          <fieldset className="rounded-xl ring-1 ring-slate-200 bg-gradient-to-br from-slate-50 to-white px-4 py-3">
            <legend className="px-1 text-sm font-semibold text-slate-800">Signos vitales</legend>

            <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <InputWithUnit
                label="Temperatura"
                placeholder="36.5"
                unit="°C"
                type="number"
                step="0.1"
                min="30"
                max="45"
                value={temperatura}
                onChange={setTemperatura}
                autoFocus
              />
              <InputWithUnit
                label="Frecuencia cardiaca"
                placeholder="70"
                unit="lpm"
                type="number"
                step="1"
                min="20"
                max="220"
                value={f_card}
                onChange={setFCard}
              />
              <InputWithUnit
                label="Frecuencia respiratoria"
                placeholder="18"
                unit="rpm"
                type="number"
                step="1"
                min="5"
                max="60"
                value={f_resp}
                onChange={setFResp}
              />
            </div>
          </fieldset>

          {/* Tarjeta: Medidas corporales */}
          <fieldset className="rounded-xl ring-1 ring-slate-200 bg-gradient-to-br from-slate-50 to-white px-4 py-3">
            <legend className="px-1 text-sm font-semibold text-slate-800">Medidas corporales</legend>

            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InputWithUnit
                label="Talla"
                placeholder="1.70"
                unit="m"
                type="number"
                step="0.01"
                min="0.3"
                max="2.5"
                value={talla}
                onChange={setTalla}
              />
              <InputWithUnit
                label="Peso"
                placeholder="70.0"
                unit="kg"
                type="number"
                step="0.1"
                min="1"
                max="400"
                value={peso}
                onChange={setPeso}
              />
            </div>

            {/* IMC preview */}
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="text-xs text-slate-600">
                IMC estimado:{" "}
                <span className="font-semibold text-slate-900">
                  {imc !== null ? imc.toFixed(2) : "—"}
                </span>
              </div>

              {/* Chip categoría */}
              <span
                className={[
                  "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold ring-1",
                  imcChip.bg, imcChip.text, imcChip.ring,
                ].join(" ")}
                title="Clasificación IMC"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-current opacity-60" />
                {imcChip.label}
              </span>
            </div>
          </fieldset>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={submit}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Input con unidad — estilo elegante, focus visible */
function InputWithUnit({
  label,
  unit,
  value,
  onChange,
  placeholder,
  type = "text",
  step,
  min,
  max,
  autoFocus,
}: {
  label: string;
  unit?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
  step?: string;
  min?: string;
  max?: string;
  autoFocus?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-700">{label}</span>
      <div className="flex items-center gap-2 rounded-xl ring-1 ring-slate-200 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500/60 shadow-sm">
        <input
          className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none"
          type={type}
          step={step}
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          inputMode="decimal"
        />
        {unit && (
          <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
            {unit}
          </span>
        )}
      </div>
    </label>
  );
}

/** Chip de IMC según categoría OMS aproximada */
function getImcChip(imc: number | null) {
  if (imc == null || !Number.isFinite(imc)) {
    return { label: "IMC —", bg: "bg-slate-50", text: "text-slate-700", ring: "ring-slate-200" };
  }
  if (imc < 18.5)   return { label: "Bajo peso", bg: "bg-amber-50",  text: "text-amber-800",  ring: "ring-amber-200" };
  if (imc < 25)     return { label: "Normal",     bg: "bg-emerald-50",text: "text-emerald-800",ring: "ring-emerald-200" };
  if (imc < 30)     return { label: "Sobrepeso",  bg: "bg-yellow-50", text: "text-yellow-800", ring: "ring-yellow-200" };
  return              { label: "Obesidad",   bg: "bg-rose-50",   text: "text-rose-800",   ring: "ring-rose-200" };
}
