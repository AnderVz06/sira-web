import { HistorialItem } from "@/types/history";
import HistorialCard from "./HistorialCard";

export default function HistorialList({ historial }: { historial: HistorialItem[] }) {
  if (!historial.length) return null;
  return (
    <section className="xl:col-span-1 h-full">
      <div className="bg-white rounded-3xl ring-1 ring-slate-200 shadow p-6 h-full">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-blue-700 font-bold text-xl flex items-center gap-2">Historial Médico</h2>
          <span className="text-xs text-slate-500">{historial.length} registro(s)</span>
        </div>
        <div className="max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 gap-4">
            {historial.map((it, idx) => (
              <HistorialCard key={it.id ?? idx} item={it} index={idx} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
