import { useEffect, useState } from "react";
import { FiFileText, FiTrash2 } from "react-icons/fi";

type Med = { nombre: string; dosis: string; frecuencia: string };

export default function FormReceta({
  onSave,
  onCancel,
  initialMedicamentos = [],     // ← nuevo
  initialIndicaciones = "",     // ← nuevo
}: {
  onSave: (meds: Med[], indicaciones?: string) => void;
  onCancel: () => void;
  initialMedicamentos?: Med[];  // ← nuevo
  initialIndicaciones?: string; // ← nuevo
}) {
  const [meds, setMeds] = useState<Med[]>(
    initialMedicamentos.length > 0 ? initialMedicamentos : [{ nombre: "", dosis: "", frecuencia: "" }]
  );
  const [indic, setIndic] = useState(initialIndicaciones);

  // sync cuando cambian props (entrar/salir de edición)
  useEffect(() => {
    setMeds(initialMedicamentos.length > 0 ? initialMedicamentos : [{ nombre: "", dosis: "", frecuencia: "" }]);
  }, [initialMedicamentos]);
  useEffect(() => setIndic(initialIndicaciones), [initialIndicaciones]);

  const addMed = () => setMeds((m) => [...m, { nombre: "", dosis: "", frecuencia: "" }]);
  const updateMed = (i: number, key: keyof Med, val: string) =>
    setMeds((m) => m.map((x, idx) => (idx === i ? { ...x, [key]: val } : x)));
  const removeMed = (i: number) => setMeds((m) => m.filter((_, idx) => idx !== i));
  const canSave = meds.some((m) => m.nombre.trim());

  return (
    <div className="mt-2 p-4 rounded-2xl ring-1 ring-blue-200 bg-blue-50/60">
      <h3 className="font-semibold text-blue-800 flex items-center gap-2">
        <FiFileText /> Receta médica
      </h3>

      <div className="mt-3 space-y-3">
        {meds.map((m, i) => (
          <div key={i} className="bg-white ring-1 ring-slate-200 rounded-xl p-3 grid grid-cols-1 md:grid-cols-12 gap-2">
            <input value={m.nombre} onChange={(e) => updateMed(i, "nombre", e.target.value)} placeholder="Medicamento" className="md:col-span-4 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 border-slate-300 w-full" />
            <input value={m.dosis} onChange={(e) => updateMed(i, "dosis", e.target.value)} placeholder="Dosis" className="md:col-span-4 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 border-slate-300 w-full" />
            <div className="md:col-span-4 flex gap-2">
              <input value={m.frecuencia} onChange={(e) => updateMed(i, "frecuencia", e.target.value)} placeholder="Frecuencia" className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 border-slate-300 w-full" />
              {meds.length > 1 && (
                <button onClick={() => removeMed(i)} className="px-3 rounded-md bg-red-50 text-red-700 ring-1 ring-red-200 hover:bg-red-100 shrink-0" title="Quitar">
                  <FiTrash2 />
                </button>
              )}
            </div>
          </div>
        ))}
        <div className="pt-1">
          <button onClick={addMed} className="w-full md:w-auto px-3 py-2 rounded-md bg-white text-blue-700 ring-1 ring-blue-200 hover:bg-blue-50">
            + Añadir medicamento
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <button onClick={onCancel} className="px-4 py-2 rounded-lg bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50">Cancelar</button>
        <button
          onClick={() => onSave(meds.filter((m) => m.nombre.trim()), indic.trim() || undefined)}
          className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium disabled:opacity-60"
          disabled={!canSave}
        >
          Agregar al caso
        </button>
      </div>
    </div>
  );
}
