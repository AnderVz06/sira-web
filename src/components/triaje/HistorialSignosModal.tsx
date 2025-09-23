import { useEffect, useState } from "react";
import { FiX, FiAlertCircle } from "react-icons/fi";
import { getVitalSignById } from "@/service/vitalsign/vitalsign";
import type { VitalSign } from "@/types/vitalsign";

export default function HistorialSignosModal({
  id,
  onClose,
}: {
  id: number;
  onClose: () => void;
}) {
  const [rows, setRows] = useState<VitalSign[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await getVitalSignById(id);
        const arr = Array.isArray(res) ? res : res ? [res] : [];
        if (mounted) setRows(arr);
      } catch (e: any) {
        if (mounted) setErr(e?.response?.data?.detail || e?.message || "No se pudo cargar");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <h3 className="text-base font-semibold">Historial de signos vitales</h3>
          <button
            className="rounded-md bg-white/10 px-2 py-1 hover:bg-white/20"
            onClick={onClose}
          >
            <FiX />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {loading && (
            <div className="flex items-center gap-2 text-slate-600 text-sm">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-transparent" />
              Cargando…
            </div>
          )}

          {err && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              <FiAlertCircle className="text-rose-600" />
              <span>{err}</span>
            </div>
          )}

          {!loading && !err && (
            <>
              {rows.length === 0 ? (
                <div className="text-sm text-slate-600">Sin registros.</div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 text-slate-600 text-xs uppercase sticky top-0">
                      <tr>
                        <Th>Fecha</Th>
                        <Th>Temp (°C)</Th>
                        <Th>FC (lpm)</Th>
                        <Th>FR (rpm)</Th>
                        <Th>Talla (m)</Th>
                        <Th>Peso (kg)</Th>
                        <Th>IMC</Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {rows.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/60">
                          <Td>{formatDateOnly(r.fecha_registro ?? null)}</Td>
                          <Td>{r.temperatura}</Td>
                          <Td>{r.f_card}</Td>
                          <Td>{r.f_resp}</Td>
                          <Td>{r.talla}</Td>
                          <Td>{r.peso}</Td>
                          <Td>{(r.imc ?? 0).toFixed(2)}</Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 flex justify-end">
          <button
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2 text-left">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-2 text-slate-800">{children}</td>;
}

// Solo día/mes/año (Perú) — sin hora
function formatDateOnly(value: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
}
