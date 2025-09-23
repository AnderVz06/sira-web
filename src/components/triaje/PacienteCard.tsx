// src/components/triaje/PacienteCard.tsx
import type { PacienteUI, VitalSignUI } from "@/types/triaje";


export default function PacienteCard({
  p,
  lastSignos,
  onSignos,
}: {
  p: PacienteUI;
  lastSignos?: (VitalSignUI & { imc?: number });
  onSignos: (mode: "create" | "update") => void; // ← cambia firma
}) {
  const imc =
    lastSignos?.imc ??
    (lastSignos && Number.isFinite(lastSignos.talla) && lastSignos.talla > 0
      ? Number((lastSignos.peso / (lastSignos.talla * lastSignos.talla)).toFixed(2))
      : undefined);


  // ¿Tenemos datos válidos de signos? (evitar mostrar "null")
  const hasVitalsData = Boolean(
    lastSignos &&
    Number.isFinite(lastSignos.temperatura) &&
    Number.isFinite(lastSignos.f_card) &&
    Number.isFinite(lastSignos.f_resp) &&
    Number.isFinite(lastSignos.talla) &&
    Number.isFinite(lastSignos.peso)
  );


  // Iniciales para el avatar (estilo ConsultaCard)
  const nombre = (p.nombre ?? "").trim();
  const apellido = (p.apellido ?? "").trim();
  const fullName = (nombre || apellido) ? `${nombre} ${apellido}`.trim() : "Paciente";
  const parts = fullName.split(/\s+/).filter(Boolean);
  const initials = `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase() || "⦿";

  const primaryCtaLabel = hasVitalsData ? "Actualizar signos vitales" : "Registrar signos";


  return (
    <div className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-[0_10px_34px_rgba(2,6,23,0.08)] p-5 hover:shadow-[0_18px_44px_rgba(2,6,23,0.14)] transition-all duration-200 flex flex-col">
      {/* Header con avatar e info */}
      <div className="flex items-start justify-between gap-4 w-full">
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative shrink-0">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-500 text-white font-bold grid place-content-center shadow-md">
              {initials}
            </div>
          </div>


          <div className="min-w-0">
            <div
              className="text-[15px] font-extrabold text-slate-900 leading-tight truncate"
              title={`${p.nombre} ${p.apellido}`}
            >
              {p.nombre} {p.apellido}
            </div>
            {/* HCE eliminado por pedido */}
            <div className="mt-0.5 text-[12px] text-slate-500">
              DNI: <span className="font-medium">{p.dni ?? "—"}</span>
            </div>
          </div>
        </div>


        {/* Chip compacto para fecha del último registro (sin icono circular) */}
        <div className="shrink-0 text-right">
          <span
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[12px] font-semibold ring-1 bg-slate-50 text-slate-700 ring-slate-200 shadow-sm"
            title="Último registro"
          >
            {formatDateOnly(lastSignos?.fecha_registro ?? null)}
          </span>
        </div>
      </div>



      {/* Signos (3x2) */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        {hasVitalsData ? (
          <>
            <Badge label="Temp" value={`${fmt1(lastSignos!.temperatura)} °C`} />
            <Badge label="FC" value={`${fmt0(lastSignos!.f_card)} lpm`} />
            <Badge label="FR" value={`${fmt0(lastSignos!.f_resp)} rpm`} />
            <Badge label="Talla" value={`${fmt2(lastSignos!.talla)} m`} />
            <Badge label="Peso" value={`${fmt1(lastSignos!.peso)} kg`} />
            <Badge label="IMC" value={`${imc !== undefined && Number.isFinite(imc) ? fmt2(imc) : "—"}`} />
          </>
        ) : (
          <div
            className="
              col-span-3 rounded-lg border border-slate-200
              bg-slate-50 ring-1 ring-slate-200
              px-4 py-3 text-slate-600
              min-h-[100px] sm:min-h-[100px]
              flex items-center justify-center text-center
              "
          >
            Sin registros de signos vitales.
          </div>
        )}
      </div>


      {/* Acciones */}
      <div className="mt-4">
        <button
          onClick={() => onSignos(hasVitalsData ? "update" : "create")}
          className="w-full rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow transition-all hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          {primaryCtaLabel}
        </button>
      </div>
    </div>
  );
}
function Badge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-gradient-to-br from-slate-50 to-white px-2.5 py-1.5 ring-1 ring-slate-200">
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="font-medium text-slate-800">{value}</div>
    </div>
  );
}


// Fecha solo día/mes/año (Perú) — sin hora
function formatDateOnly(value: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
}


// Helpers de formato: devuelven "—" si el dato no es válido
function fmt0(n: number) { return Number.isFinite(n) ? String(Math.round(n)) : "—"; }
function fmt1(n: number) { return Number.isFinite(n) ? n.toFixed(1) : "—"; }
function fmt2(n: number) { return Number.isFinite(n) ? n.toFixed(2) : "—"; }