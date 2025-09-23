import { useMemo, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { Toolbar } from "@/components/admin/users/Toolbar";
import { UserTable } from "@/components/admin/users/UserTable";
import { Pagination } from "@/components/admin/users/Pagination";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useUsersPaged } from "@/hooks/admin/useUsersPaged";
import { ToastContainer } from "@/components/ui/Toast";

const AdminUsuariosContainer = () => {
  const [query, setQuery] = useState("");
  const [fRol, setFRol] = useState<"todos" | "admin" | "medico" | "enfermero">("todos");
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [page, setPage] = useState(1);

  const pageSize = 6;
  const debouncedQuery = useDebouncedValue(query, 350);

  const { rows, totalItems, totalPages, loading, error } = useUsersPaged({
    page,
    size: pageSize,
    search: debouncedQuery || undefined,
    role: fRol === "todos" ? undefined : fRol,
  });

  const allOnPageSelected = rows.length > 0 && rows.every((u) => selected[u.id]);
  const toggleSelectAllOnPage = (checked: boolean) => {
    const copy = { ...selected };
    rows.forEach((u) => (copy[u.id] = checked));
    setSelected(copy);
  };
  const clearSelection = () => setSelected({});

  const selectedCount = useMemo(() => Object.values(selected).filter(Boolean).length, [selected]); // por si luego usas bulk ops

  const handleQuery = (v: string) => { setQuery(v); setPage(1); };
  const handleRol = (v: "todos" | "admin" | "medico" | "enfermero") => { setFRol(v); setPage(1); };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 via-white to-white">
      <ToastContainer />
      <div className="flex-1 pl-[5px] flex">
        <div className="w-full min-h-screen bg-white/80 backdrop-blur-sm rounded-3xl shadow-[0_24px_60px_rgba(2,6,23,0.10)] ring-1 ring-slate-200 flex flex-col overflow-hidden">
          {/* HERO */}
          <section className="px-6 md:px-10 pt-6 pb-0">
            <div className="w-full rounded-2xl p-[1px] bg-[conic-gradient(at_10%_10%,#1d4ed8_0_20%,#4f46e5_20_40%,#1d4ed8_40_60%,#4f46e5_60_80%,#1d4ed8_80_100%)]">
              <div className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex items-center gap-5 shadow-lg ring-1 ring-white/15">
                <button className="h-10 w-10 rounded-xl bg-white/10 text-white grid place-content-center hover:bg-white/20" title="Volver" onClick={() => window.history.back()}>
                  <FiArrowLeft />
                </button>
                <div className="flex-1 min-w-[260px]">
                  <p className="text-blue-100/90 text-xs font-medium tracking-wide mb-1">Administración</p>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">Usuarios</h1>
                  <p className="text-blue-100/90 text-sm mt-1">Gestiona roles, áreas y accesos</p>
                </div>
              </div>
            </div>
          </section>

          {/* CONTENIDO */}
          <main className="flex-1 min-h-0 overflow-auto p-6 md:p-10 pt-0 pb-28">
            <div className="rounded-2xl bg-white border border-slate-200 ring-1 ring-slate-200 shadow-sm p-4 md:p-5">
              <Toolbar query={query} onQuery={handleQuery} rol={fRol} onRol={handleRol} />

              {loading && (<div className="mt-4 text-sm text-slate-600">Cargando usuarios…</div>)}
              {error && (<div className="mt-4 text-sm text-rose-700 bg-rose-50 ring-1 ring-rose-200 rounded-xl p-3">{error}</div>)}

              <UserTable
                rows={rows}
                selected={selected}
                onToggleRow={(id, checked) => setSelected((s) => ({ ...s, [id]: checked }))}
                allOnPageSelected={allOnPageSelected}
                onToggleAllOnPage={toggleSelectAllOnPage}
              />

              <Pagination
                page={page}
                totalPages={totalPages}
                totalItems={totalItems}
                onPrev={() => setPage((p) => Math.max(1, p - 1))}
                onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminUsuariosContainer;
