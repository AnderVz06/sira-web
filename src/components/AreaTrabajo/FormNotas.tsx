import { useEffect, useState } from "react";

export default function FormNotas({
  onSave,
  onCancel,
  initialNotas = "",          // ← nuevo
}: {
  onSave: (notas: string) => void;
  onCancel: () => void;
  initialNotas?: string;      // ← nuevo
}) {
  const [valor, setValor] = useState(initialNotas);

  // sync cuando cambie el prop
  useEffect(() => setValor(initialNotas), [initialNotas]);

  return (
    <div className="mt-2 p-4 rounded-2xl ring-1 ring-violet-200 bg-violet-50/60">
      <h3 className="font-semibold text-violet-800">Notas</h3>

      <div className="mt-3">
        <textarea
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          rows={6}
          maxLength={2000}
          placeholder="Escribe observaciones y notas clínicas…"
          className="w-full border border-slate-300 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white"
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
          className="px-6 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 font-medium disabled:opacity-60"
        >
          Agregar al caso
        </button>
      </div>
    </div>
  );
}
