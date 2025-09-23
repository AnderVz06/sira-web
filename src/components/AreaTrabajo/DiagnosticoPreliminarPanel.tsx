import { useEffect, useState } from "react";
import { HiOutlineDocumentReport } from "react-icons/hi";

type Signos = {
  temperatura?: number;
  f_card?: number;
  f_resp?: number;
  talla?: number; // m
  peso?: number;  // kg
};

export default function DiagnosticoPreliminarPanel({
  initialSignos,
  initialMotivo = "",
  initialExamen = "",
  onConfirm,
}: {
  initialSignos?: Signos;
  initialMotivo?: string;   // ← nuevo
  initialExamen?: string;   // ← nuevo
  onConfirm?: (payload: { motivo: string; examen: string; signos: Signos }) => void;
}) {
  const [motivo, setMotivo] = useState(initialMotivo);
  const [examen, setExamen] = useState(initialExamen);

  // sync cuando cambian props (al entrar a editar)
  useEffect(() => setMotivo(initialMotivo), [initialMotivo]);
  useEffect(() => setExamen(initialExamen), [initialExamen]);

  const limpiar = () => { setMotivo(""); setExamen(""); };

  const handleConfirm = () => {
    const signos: Signos = {
      temperatura: isFiniteNumber(initialSignos?.temperatura) ? initialSignos?.temperatura : undefined,
      f_card:      isFiniteNumber(initialSignos?.f_card)      ? initialSignos?.f_card      : undefined,
      f_resp:      isFiniteNumber(initialSignos?.f_resp)      ? initialSignos?.f_resp      : undefined,
      talla:       isFiniteNumber(initialSignos?.talla)       ? initialSignos?.talla       : undefined,
      peso:        isFiniteNumber(initialSignos?.peso)        ? initialSignos?.peso        : undefined,
    };
    onConfirm?.({ motivo: motivo.trim(), examen: examen.trim(), signos });
  };

  const canSave = Boolean(motivo.trim() && examen.trim());

  const t  = initialSignos?.temperatura;
  const fc = initialSignos?.f_card;
  const fr = initialSignos?.f_resp;
  const ta = initialSignos?.talla;
  const pe = initialSignos?.peso;

  const hasAnySignos = [t, fc, fr, ta, pe].some(isFiniteNumber);

  return (
    <div className="mt-2 rounded-2xl ring-1 ring-amber-200 bg-amber-50/50 p-4">
      <h3 className="font-semibold text-amber-800 flex items-center gap-2">
        <HiOutlineDocumentReport /> Diagnóstico preliminar
      </h3>

      {hasAnySignos && (
        <div className="mt-4">
          <h4 className="text-slate-700 font-medium mb-2">Signos vitales actuales</h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-sm">
            <Chip label="Temp"  value={fmt(t,  "°C")} />
            <Chip label="FC"    value={fmt(fc, "bpm")} />
            <Chip label="FR"    value={fmt(fr, "rpm")} />
            <Chip label="Talla" value={fmt(ta, "m")} />
            <Chip label="Peso"  value={fmt(pe, "kg")} />
          </div>
        </div>
      )}

      {/* Motivo */}
      <div className="mt-4">
        <label className="block font-medium text-slate-800 mb-1">
          Motivo de Consulta <span className="text-red-600">*</span>
        </label>
        <textarea
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          rows={3}
          maxLength={500}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
          placeholder="Describa el motivo de la consulta…"
        />
        <div className="text-right text-xs text-slate-500">{motivo.length}/500</div>
      </div>

      {/* Examen físico */}
      <div className="mt-3">
        <label className="block font-medium text-slate-800 mb-1">
          Examen Físico <span className="text-red-600">*</span>
        </label>
        <textarea
          value={examen}
          onChange={(e) => setExamen(e.target.value)}
          rows={4}
          maxLength={1000}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
          placeholder="Registre los hallazgos del examen físico…"
        />
        <div className="text-right text-xs text-slate-500">{examen.length}/1000</div>
      </div>

      {/* Acciones */}
      <div className="mt-4 flex items-center justify-between">
        <button type="button" onClick={limpiar} className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300">
          Limpiar
        </button>
        <button
          onClick={handleConfirm}
          className="px-6 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 font-medium disabled:opacity-60"
          disabled={!canSave}
        >
          Agregar al caso
        </button>
      </div>
    </div>
  );
}

function isFiniteNumber(n?: number) { return typeof n === "number" && Number.isFinite(n); }
function fmt(v?: number, suf?: string) { return v == null || !Number.isFinite(v) ? "—" : `${v}${suf ? ` ${suf}` : ""}`; }
function Chip({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="px-3 py-2 rounded-xl text-center ring-1 bg-amber-50 text-amber-800 ring-amber-200">
      <div className="text-[11px] uppercase tracking-wide opacity-70">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}
