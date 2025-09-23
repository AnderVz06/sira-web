// src/pages/consultas/ConsultasMedicoContainer.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiFilter, FiChevronDown, FiCalendar } from "react-icons/fi";
import ConsultaCard from "@/components/consultas/ConsultaCard";
import Pagination from "@/components/consultas/Pagination";
import type { Status } from "@/types/consultation";
import { useConsultasHoy } from "@/hooks/consultas/useConsultasHoy";

const PAGE_SIZE = 8;

// Estados válidos del backend + "Todos" para el filtro
const ESTADO_OPCIONES = ["Todos", "En espera", "Terminado", "Cancelado"] as const;
type FiltroEstado = (typeof ESTADO_OPCIONES)[number];

export default function ConsultasMedicoContainer() {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [estado, setEstado] = useState<FiltroEstado>("En espera"); // por defecto "En espera"
  const [orden, setOrden] = useState<"Llegada" | "Horario">("Llegada");
  const [page, setPage] = useState(1);

  // Médico ve solo sus consultas
  const { items, loading, error, reload } = useConsultasHoy("medico");

  const filtered = useMemo(() => {
    let list = [...items];
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          (c.nombre || "").toLowerCase().includes(q) ||
          (c.apellido || "").toLowerCase().includes(q) ||
          (c.hce || "").toLowerCase().includes(q) ||
          (c.dni || "").includes(q)
      );
    }
    if (estado !== "Todos") list = list.filter((c) => c.estado === estado);
    list.sort((a, b) => {
      const A = new Date(orden === "Llegada" ? a.llegada : a.cita).getTime();
      const B = new Date(orden === "Llegada" ? b.llegada : b.cita).getTime();
      return A - B;
    });
    return list;
  }, [items, query, estado, orden]);

  useEffect(() => setPage(1), [query, estado, orden]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const currentItems = filtered.slice(start, start + PAGE_SIZE);

  const canRealizar = (estado: Status, _cita?: string) =>
    estado !== "Terminado" && estado !== "Cancelado";

  const showEmptyGlobal = !loading && items.length === 0;
  const showEmptyFiltered = !loading && items.length > 0 && filtered.length === 0;

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 via-slate-50 to-white">
      <div className="flex-1 pl-[5px] flex">
        <div className="w-full min-h-screen bg-white/80 backdrop-blur-sm rounded-3xl shadow-[0_20px_60px_rgba(2,6,23,0.12)] ring-1 ring-slate-200 flex flex-col overflow-hidden">
          {/* HERO */}
          <section className="px-6 md:px-10 pt-6 pb-4">
            <div className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-500 p-6 flex items-center gap-5 shadow-lg ring-1 ring-white/20">
              <div className="flex-1">
                <p className="text-blue-100 text-xs font-medium tracking-wide mb-1">
                  Panel del médico • Consultas
                </p>
                <h1 className="text-3xl font-extrabold text-white">Mis consultas de hoy</h1>
                <p className="text-blue-100 text-sm mt-1">Visualiza tus consultas asignadas.</p>
              </div>
              <button
                onClick={reload}
                className="h-10 px-3 rounded-xl bg-white text-blue-700 text-sm font-semibold shadow hover:shadow-md"
              >
                Actualizar
              </button>
            </div>
          </section>

          {/* Controles */}
          <div className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="px-6 md:px-10 py-3">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-6 lg:col-span-7">
                  <div className="flex items-center gap-2 rounded-2xl ring-1 ring-slate-200 bg-white px-3 h-12 shadow-sm">
                    <FiSearch className="text-slate-400" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Buscar por paciente, DNI o HCE…"
                      className="w-full bg-transparent outline-none text-[15px]"
                    />
                  </div>
                </div>

                <div className="md:col-span-3 lg:col-span-3">
                  <div className="relative">
                    <select
                      value={estado}
                      onChange={(e) => setEstado(e.target.value as FiltroEstado)}
                      className="h-12 w-full text-sm rounded-2xl ring-1 ring-slate-200 bg-white px-3 pr-10 shadow-sm"
                    >
                      {ESTADO_OPCIONES.map((op) => (
                        <option key={op} value={op}>{op}</option>
                      ))}
                    </select>
                    <FiFilter className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <div className="md:col-span-3 lg:col-span-2">
                  <div className="relative">
                    <select
                      value={orden}
                      onChange={(e) => setOrden(e.target.value as any)}
                      className="h-12 w-full text-sm rounded-2xl ring-1 ring-slate-200 bg-white px-3 pr-10 shadow-sm"
                    >
                      <option value="Llegada">Orden de llegada</option>
                      <option value="Horario">Por horario</option>
                    </select>
                    <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Listado */}
          <main className="flex-1 min-h-0 overflow-auto p-6 md:p-10 pt-2 pb-20">
            {loading && <div className="mt-2 text-sm text-slate-600">Cargando consultas…</div>}
            {error && (
              <div className="mt-2 text-sm text-rose-700 bg-rose-50 ring-1 ring-rose-200 rounded-xl p-3">
                {error}
              </div>
            )}

            {/* Empty state: no hay ninguna consulta hoy */}
            {showEmptyGlobal && (
              <div className="mt-14 flex justify-center">
                <div className="max-w-md w-full text-center rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="mx-auto mb-3 h-12 w-12 rounded-xl bg-blue-50 text-blue-600 grid place-items-center">
                    <FiCalendar className="text-xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    No tienes consultas registradas hoy
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Cuando se te asignen consultas, aparecerán aquí.
                  </p>
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={reload}
                      className="h-10 px-4 rounded-xl ring-1 ring-slate-200 bg-white text-slate-700 text-sm font-semibold shadow hover:bg-slate-50"
                    >
                      Actualizar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Empty state: existen consultas, pero los filtros no coinciden */}
            {showEmptyFiltered && (
              <div className="mt-14 flex justify-center">
                <div className="max-w-md w-full text-center rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-800">
                    Sin resultados con los filtros actuales
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Ajusta la búsqueda, estado u orden para ver más resultados.
                  </p>
                </div>
              </div>
            )}

            {/* Grid de tarjetas */}
            {!showEmptyGlobal && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                {currentItems.map((c, idx) => (
                  <ConsultaCard
                    key={c.id}
                    item={c}
                    position={start + idx + 1}
                    canRealizar={canRealizar(c.estado, c.cita)}
                    onRealizar={() => {
                      if (!c.dni) {
                        console.warn("No hay DNI en la consulta, no se puede navegar a RealizarConsulta");
                        return;
                      }
                      navigate(
                        `/realizar-Consulta/${encodeURIComponent(c.dni)}?consulta_id=${encodeURIComponent(String(c.id))}`
                      );
                    }}
                  />
                ))}
              </div>
            )}

            {/* Paginación */}
            {!showEmptyGlobal && filtered.length > 0 && (
              <div className="sticky bottom-0 z-10 mt-6 -mx-6 md:-mx-10 border-t border-slate-200/70 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  totalItems={filtered.length}
                  onPrev={() => setPage((p) => Math.max(1, p - 1))}
                  onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
                />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
