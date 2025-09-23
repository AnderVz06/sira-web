// src/pages/triaje/TriajeContainer.tsx
import { useMemo, useState } from "react";
import { FiChevronDown, FiFilter, FiSearch, FiUserPlus } from "react-icons/fi";

import type { Genero, PacienteUI } from "@/types/triaje";
import { usePacientesPaged } from "@/hooks/triaje/usePacientesPaged";
import { useVitalSignsCache } from "@/hooks/triaje/useVitalSignsCache";

import EmptyState from "@/components/common/EmptyState";
import PacienteCard from "@/components/triaje/PacienteCard";
import AgregarPacienteModal from "@/components/triaje/AgregarPacienteModal";
import AgregarSignosModal from "@/components/triaje/AgregarSignosModal";
import EditarSignosModal from "@/components/triaje/EditarSignosModal";

import {
  createPacienteUI,
  createVitalSignUI,
} from "@/components/ui/triaje/actions";

const PAGE_SIZE = 8;

const TriajeContainer = () => {
  const [query, setQuery] = useState("");
  const [genero, setGenero] = useState<Genero | "todos">("todos");
  const [page, setPage] = useState(1);

  // NUEVO: orden alfabético A→Z o Z→A (aplica en la página actual)
  const [orden, setOrden] = useState<"alf-asc" | "alf-desc">("alf-desc");

  const { rows, totalItems, totalPages, loading, error, reload } = usePacientesPaged({
    page,
    size: PAGE_SIZE,
    search: query || undefined,
    genero,
  });

  const dnis = useMemo(() => rows.map((p) => p.dni), [rows]);
  const { lastByDni, refresh: refreshDni } = useVitalSignsCache(dnis);

  const [showPacienteModal, setShowPacienteModal] = useState(false);
  const [signosTarget, setSignosTarget] = useState<PacienteUI | null>(null); // create
  const [editTarget, setEditTarget] = useState<PacienteUI | null>(null); // update

  const start = (page - 1) * PAGE_SIZE;

  // ===== Ordenamiento alfabético sobre la página actual =====
  const rowsSorted = useMemo(() => {
    const norm = (s?: string) => (s ?? "").trim();
    const key = (p: PacienteUI) => {
      // Apellido + Nombre como clave primaria; fallback: nombre o DNI
      const apellido = norm((p as any).apellido);
      const nombre = norm((p as any).nombre);
      const full = (apellido || nombre) ? `${apellido} ${nombre}`.trim() : norm((p as any).hce) || norm(p.dni);
      return full.toLocaleLowerCase();
    };

    const out = [...rows].sort((a, b) => {
      const ka = key(a);
      const kb = key(b);
      const cmp = ka.localeCompare(kb, "es", { sensitivity: "base", numeric: true });
      return orden === "alf-asc" ? cmp : -cmp;
    });
    return out;
  }, [rows, orden]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 via-white to-white">
      {/* HERO */}
      <section className="px-6 md:px-10 pt-6 pb-4">
        <div className="w-full rounded-2xl bg-[conic-gradient(at_10%_10%,#1d4ed8_0_20%,#4f46e5_20%_40%,#1d4ed8_40%_60%,#4f46e5_60%_80%,#1d4ed8_80%_100%)] p-[1px]">
          <div className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex flex-wrap items-center gap-5 shadow-lg ring-1 ring-white/15">
            <div className="flex-1 min-w-[260px]">
              <p className="text-blue-100/90 text-xs font-medium tracking-wide mb-1">
                Panel de gestión • Triaje
              </p>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
                Registro y evaluación de triaje
              </h1>
              <p className="text-blue-100/90 text-sm mt-1">
                Agrega pacientes y registra sus signos vitales de manera ágil.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPacienteModal(true)}
                className="h-11 px-4 rounded-xl bg-white text-blue-700 font-semibold shadow hover:shadow-md inline-flex items-center gap-2"
              >
                <FiUserPlus /> Nuevo paciente
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Controles (sticky) */}
      <div className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="px-6 md:px-10 py-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-7 lg:col-span-7">
              <div className="flex items-center gap-2 rounded-2xl ring-1 ring-slate-200 bg-white px-3 h-12 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/60">
                <FiSearch className="text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Buscar por nombre, apellido, DNI o HCE…"
                  className="w-full bg-transparent outline-none text-[15px] placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="md:col-span-3 lg:col-span-3">
              <div className="relative">
                <select
                  value={genero}
                  onChange={(e) => {
                    setGenero(e.target.value as any);
                    setPage(1);
                  }}
                  className="h-12 w-full text-sm rounded-2xl ring-1 ring-slate-200 bg-white px-3 pr-10 shadow-sm focus:ring-2 focus:ring-blue-500/60"
                >
                  <option value="todos">Todos</option>
                  <option value="m">Masculino</option>
                  <option value="f">Femenino</option>
                </select>
                <FiFilter className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div className="md:col-span-2 lg:col-span-2">
              <div className="relative">
                <select
                  value={orden}
                  onChange={(e) => setOrden(e.target.value as "alf-asc" | "alf-desc")}
                  className="h-12 w-full text-sm rounded-2xl ring-1 ring-slate-200 bg-white px-3 pr-10 shadow-sm"
                >
                  <option value="alf-desc">Orden alfabético (A–Z)</option>
                  <option value="alf-asc">Orden alfabético (Z–A)</option>
                </select>
                <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Listado + paginación */}
      <main className="flex-1 min-h-0 overflow-auto p-6 md:p-10 pt-2 pb-24">
        {loading && <div className="text-sm text-slate-600">Cargando pacientes…</div>}
        {error && (
          <div className="text-sm text-rose-700 bg-rose-50 ring-1 ring-rose-200 rounded-xl p-3 mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {rowsSorted.map((p) => (
            <PacienteCard
              key={p.dni}
              p={p}
              lastSignos={lastByDni[p.dni]}
              onSignos={(mode) => {
                if (mode === "update") setEditTarget(p);
                else setSignosTarget(p);
              }}
            />
          ))}
        </div>

        {/* Empty state: ABAJO centrado */}
        {rowsSorted.length === 0 && !loading && (
          <div className="flex justify-center py-16">
            <EmptyState
              title="Sin resultados"
              desc="No hay pacientes que coincidan con los filtros actuales."
              actionLabel="Agregar paciente"
              onAction={() => setShowPacienteModal(true)}
            />
          </div>
        )}

        {/* Paginación: solo cuando hay resultados */}
        {totalItems > 0 && (
          <div className="sticky bottom-0 z-10 mt-8 -mx-6 md:-mx-10 border-t border-slate-200/70 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="px-6 md:px-10 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-sm text-slate-600">
                Mostrando{" "}
                <span className="font-semibold">{totalItems === 0 ? 0 : start + 1}</span>
                –
                <span className="font-semibold">
                  {Math.min(totalItems, start + rows.length)}
                </span>{" "}
                de <span className="font-semibold">{totalItems}</span> ·{" "}
                <span className="text-slate-500">{PAGE_SIZE}/página</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-9 px-3 rounded-lg ring-1 ring-slate-200 text-sm font-medium shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:bg-slate-50"
                >
                  ← Anterior
                </button>

                <div className="px-2 text-sm text-slate-700">
                  Página <span className="font-semibold">{page}</span> / {totalPages}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-9 px-3 rounded-lg ring-1 ring-slate-200 text-sm font-medium shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:bg-slate-50"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal: nuevo paciente */}
      {showPacienteModal && (
        <AgregarPacienteModal
          onClose={() => setShowPacienteModal(false)}
          onSuccess={async (nuevo) => {
            await createPacienteUI(nuevo);
            setShowPacienteModal(false);
            await reload();
          }}
        />
      )}

      {/* Modal: registrar signos (CREATE) */}
      {signosTarget && (
        <AgregarSignosModal
          dni={signosTarget.dni}
          edad={signosTarget.edad}
          genero={signosTarget.genero}
          onClose={() => setSignosTarget(null)}
          onSuccess={async (signos) => {
            await createVitalSignUI(signos);
            await refreshDni(signosTarget.dni);
            setSignosTarget(null);
          }}
        />
      )}

      {/* Modal: editar signos (UPDATE vía PUT) */}
      {editTarget && lastByDni[editTarget.dni] && (
        <EditarSignosModal
          id={lastByDni[editTarget.dni]!.id}
          dni={editTarget.dni}
          initial={lastByDni[editTarget.dni]!}
          onClose={() => setEditTarget(null)}
          onSuccess={async () => {
            await refreshDni(editTarget.dni);
            setEditTarget(null);
          }}
        />
      )}
    </div>
  );
};

export default TriajeContainer;
