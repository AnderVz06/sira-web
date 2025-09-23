import { useState } from "react";
import { HiOutlineDocumentSearch } from "react-icons/hi";

const posiblesExamenes = ["Hemograma", "Glucosa", "Perfil lipídico", "PCR", "Rx Tórax", "Prueba Covid"];

export default function FormOrden({
  onSave,
  onCancel,
}: {
  onSave: (examenes: string[], indicaciones?: string) => void;
  onCancel: () => void;
}) {
  const [seleccion, setSeleccion] = useState<string[]>([]);
  const [indic, setIndic] = useState("");

  const toggle = (ex: string) =>
    setSeleccion((prev) => (prev.includes(ex) ? prev.filter((e) => e !== ex) : [...prev, ex]));

  return (
    <div className="mt-2 p-4 rounded-2xl ring-1 ring-indigo-200 bg-indigo-50/60">
      <h3 className="font-semibold text-indigo-800 flex items-center gap-2">
        <HiOutlineDocumentSearch /> Orden de evaluaciones
      </h3>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {posiblesExamenes.map((ex) => {
          const active = seleccion.includes(ex);
          return (
            <button
              key={ex}
              onClick={() => toggle(ex)}
              className={`text-left px-3 py-2 rounded-lg ring-1 transition
              ${active ? "bg-indigo-600 text-white ring-indigo-500" : "bg-white text-indigo-700 ring-indigo-200 hover:bg-indigo-50"}`}
            >
              {ex}
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        <label className="block font-medium text-slate-800 mb-1">Indicaciones</label>
        <textarea value={indic} onChange={(e) => setIndic(e.target.value)} rows={3} className="w-full border border-slate-300 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white" placeholder="Instrucciones para el paciente…" />
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <button onClick={onCancel} className="px-4 py-2 rounded-lg bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50">Cancelar</button>
        <button onClick={() => onSave(seleccion, indic.trim() || undefined)} className="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-medium disabled:opacity-60" disabled={seleccion.length === 0}>
          Agregar al caso
        </button>
      </div>
    </div>
  );
}
