import { useMemo, useState } from "react";
import type { VitalSignUI } from "@/types/triaje";
import { updateVitalSign } from "@/service/vitalsign/vitalsign";

type UpdatePayload = {
  temperatura: number;
  f_card: number;
  f_resp: number;
  talla: number;
  peso: number;
  dni: string;
};

export default function EditarSignosModal({
  id,
  dni,
  initial,
  onClose,
  onSuccess,
}: {
  id: number;
  dni: string;
  initial: VitalSignUI;
  onClose: () => void;
  onSuccess: () => void;
}) {
  // Campos vacíos: el usuario debe ingresarlos (no se envían valores antiguos)
  const [form, setForm] = useState({
    temperatura: "", // string
    f_card: "",
    f_resp: "",
    talla: "",
    peso: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Rangos de validación
  const limits = {
    temperatura: { min: 30, max: 45 },
    f_card: { min: 20, max: 220 },
    f_resp: { min: 5, max: 60 },
    talla: { min: 0.3, max: 2.5 },
    peso: { min: 1, max: 400 },
  } as const;

  type FormKey = keyof typeof form;

  const handleChange = (k: FormKey, v: string) => {
    const value = v.trim().replace(",", ".");
    setForm((f) => ({ ...f, [k]: value }));
  };

  // Invalids (seguimos validando pero sin pintar en rojo)
  const invalids = useMemo(() => {
    const out: Partial<Record<FormKey, boolean>> = {};
    (Object.keys(form) as FormKey[]).forEach((k) => {
      const raw = form[k];
      if (raw === "") {
        out[k] = true;
        return;
      }
      const num = Number(raw);
      const lim = limits[k];
      if (!Number.isFinite(num) || num < lim.min || num > lim.max) {
        out[k] = true;
      }
    });
    return out;
  }, [form]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (Object.values(invalids).some(Boolean)) {
      setError("Completa todos los campos con valores válidos dentro del rango indicado.");
      return;
    }

    const payload: UpdatePayload = {
      dni,
      temperatura: Number(form.temperatura),
      f_card: Number(form.f_card),
      f_resp: Number(form.f_resp),
      talla: Number(form.talla),
      peso: Number(form.peso),
    };

    try {
      setSubmitting(true);
      await updateVitalSign(id, payload);
      onSuccess();
    } catch (err: any) {
      setError(err?.message || "Error actualizando signos vitales");
    } finally {
      setSubmitting(false);
    }
  };

  // Valores previos para placeholders
  const prev = {
    temperatura: initial?.temperatura ?? null,
    f_card: initial?.f_card ?? null,
    f_resp: initial?.f_resp ?? null,
    talla: initial?.talla ?? null,
    peso: initial?.peso ?? null,
  };

  const fmt = (n: number | null, digits = 1) =>
    n == null ? "" : Number(n).toFixed(digits).replace(/\.0$/, "");

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 backdrop-blur-[1px] p-4">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white">
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-white text-blue-700 grid place-content-center font-extrabold shadow">
              SV
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-extrabold leading-tight truncate">
                Actualizar signos vitales
              </h2>
              <p className="text-blue-100 text-xs">
                DNI: <span className="font-semibold text-white/95">{dni}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {error && (
            <div className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {error}
            </div>
          )}
          
          {/* Signos vitales */}
          <fieldset className="rounded-xl ring-1 ring-slate-200 bg-gradient-to-br from-slate-50 to-white px-4 py-3">
            <legend className="px-1 text-sm font-semibold text-slate-800">
              Signos vitales
            </legend>

            <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Temperatura">
                <div className="flex items-center gap-2 rounded-xl ring-1 ring-slate-200 bg-white px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/60">
                  <input
                    type="number"
                    step="0.1"
                    min={30}
                    max={45}
                    value={form.temperatura}
                    onChange={(e) => handleChange("temperatura", e.target.value)}
                    placeholder={fmt(prev.temperatura, 1) || "36.5"}
                    className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none"
                  />
                  <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                    °C
                  </span>
                </div>
              </Field>

              <Field label="Frecuencia cardiaca">
                <div className="flex items-center gap-2 rounded-xl ring-1 ring-slate-200 bg-white px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/60">
                  <input
                    type="number"
                    step="1"
                    min={20}
                    max={220}
                    value={form.f_card}
                    onChange={(e) => handleChange("f_card", e.target.value)}
                    placeholder={fmt(prev.f_card, 0) || "70"}
                    className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none"
                  />
                  <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                    lpm
                  </span>
                </div>
              </Field>

              <Field label="Frecuencia respiratoria">
                <div className="flex items-center gap-2 rounded-xl ring-1 ring-slate-200 bg-white px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/60">
                  <input
                    type="number"
                    step="1"
                    min={5}
                    max={60}
                    value={form.f_resp}
                    onChange={(e) => handleChange("f_resp", e.target.value)}
                    placeholder={fmt(prev.f_resp, 0) || "18"}
                    className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none"
                  />
                  <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                    rpm
                  </span>
                </div>
              </Field>
            </div>
          </fieldset>

          {/* Medidas corporales */}
          <fieldset className="rounded-xl ring-1 ring-slate-200 bg-gradient-to-br from-slate-50 to-white px-4 py-3">
            <legend className="px-1 text-sm font-semibold text-slate-800">
              Medidas corporales
            </legend>

            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Talla">
                <div className="flex items-center gap-2 rounded-xl ring-1 ring-slate-200 bg-white px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/60">
                  <input
                    type="number"
                    step="0.01"
                    min={0.3}
                    max={2.5}
                    value={form.talla}
                    onChange={(e) => handleChange("talla", e.target.value)}
                    placeholder={fmt(prev.talla, 2) || "1.70"}
                    className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none"
                  />
                  <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                    m
                  </span>
                </div>
              </Field>

              <Field label="Peso">
                <div className="flex items-center gap-2 rounded-xl ring-1 ring-slate-200 bg-white px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/60">
                  <input
                    type="number"
                    step="0.1"
                    min={1}
                    max={400}
                    value={form.peso}
                    onChange={(e) => handleChange("peso", e.target.value)}
                    placeholder={fmt(prev.peso, 1) || "70.0"}
                    className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none"
                  />
                  <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                    kg
                  </span>
                </div>
              </Field>
            </div>
          </fieldset>

          {/* Footer */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60"
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold shadow hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="mb-1 text-xs font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}
