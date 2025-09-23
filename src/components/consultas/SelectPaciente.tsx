// src/components/consultas/SelectPaciente.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { usePacientesMini } from "@/hooks/pacientes/usePacientesMini";

function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export default function SelectPaciente({
  dni,
  onChangeDni,
  onChangeNombre,             // opcional
  label = "Paciente",
  placeholder = "Buscar por nombre o DNI…",
}: {
  dni: string;
  onChangeDni: (dni: string) => void;
  onChangeNombre?: (name: string) => void;
  label?: string;
  placeholder?: string;
}) {
  const [search, setSearch] = useState(dni ?? "");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Heurística: si es todo dígitos => probablemente está buscando por DNI
  const isDniQuery = /^\d+$/.test(search.trim());

  // Para DNI: NO pases search al hook (la API no filtra bien por DNI).
  // Para nombre: sí pasamos search para que el server ayude a reducir.
  const searchForHook = isDniQuery ? undefined : search;

  // Sin paginar en UI: trae hasta 1000 (ajusta a tu volumen)
  const { rows, loading } = usePacientesMini({ page: 1, size: 1000, search: searchForHook });

  // Filtro local por nombre o DNI, y limita a 10 visibles
  const visible = useMemo(() => {
    const q = search.trim();
    if (!q) return rows.slice(0, 10);

    const qNorm = normalize(q);
    const qDigits = q.replace(/\D/g, "");

    return rows
      .filter((p: any) => {
        const nameMatch = normalize(p.full_name || "").includes(qNorm);
        const dniMatch = String(p.dni || "").includes(qDigits);
        return nameMatch || (!!qDigits && dniMatch);
      })
      .slice(0, 10);
  }, [rows, search]);

  useEffect(() => setSearch(dni ?? ""), [dni]);

  // click-away
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (ref.current.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-700">{label}</span>
      <div className="relative" ref={ref}>
        <input
          className="w-full bg-white text-sm text-slate-900 placeholder-slate-400 outline-none rounded-xl ring-1 ring-slate-200 px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500/60"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 60)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
            if (e.key === "Enter" && visible[0]) {
              onChangeDni(visible[0].dni);
              onChangeNombre?.(visible[0].full_name);
              setSearch(visible[0].dni);
              setOpen(false);
            }
          }}
          placeholder={placeholder}
          autoComplete="off"
          inputMode="search"
        />

        {open && (
          <div className="absolute z-20 mt-1 w-full max-h-56 overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
            {loading && <div className="px-3 py-2 text-sm text-slate-500">Cargando…</div>}
            {!loading && visible.length === 0 && (
              <div className="px-3 py-2 text-sm text-slate-500">Sin resultados</div>
            )}
            {!loading && visible.map((p: any) => (
              <button
                key={`${p.dni}-${p.full_name}`}
                type="button"
                className="block w-full text-left px-3 py-2 text-sm hover:bg-slate-50"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChangeDni(p.dni);
                  onChangeNombre?.(p.full_name);
                  setSearch(p.dni); // o p.full_name, según prefieras
                  setOpen(false);
                }}
              >
                <div className="font-medium text-slate-800">{p.full_name}</div>
                <div className="text-xs text-slate-500">DNI: {p.dni}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </label>
  );
}
