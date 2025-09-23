import { useEffect, useState } from "react";

export default function FormIndicaciones({
  onSave,
  onCancel,
  initialIndicaciones = "",   // ← nuevo
}: {
  onSave: (indicaciones: string) => void;
  onCancel: () => void;
  initialIndicaciones?: string; // ← nuevo
}) {
  const [valor, setValor] = useState(initialIndicaciones);

  // sync cuando cambie el prop
  useEffect(() => setValor(initialIndicaciones), [initialIndicaciones]);

  return (
    <div className="mt-2 p-4 rounded-2xl ring-1 ring-teal-200 bg-teal-50/60">
      <h3 className="font-semibold text-teal-800">Indicaciones</h3>

      <div className="mt-3">
        <textarea
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          rows={5}
          maxLength={2000}
          placeholder="Escribe indicaciones generales para el paciente…"
          className="w-full border border-slate-300 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-teal-300 bg-white"
        />
        <div className="text-right text-xs text-slate-500">{valor.length}/2000</div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        <button onClick={onCancel} className="px-4 py-2 rounded-lg bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50">
          Cancelar
        </button>
        <button
          onClick={() => onSave(valor.trim())}
          disabled={!valor.trim()}
          className="px-6 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 font-medium disabled:opacity-60"
        >
          Agregar al caso
        </button>
      </div>
    </div>
  );
}
