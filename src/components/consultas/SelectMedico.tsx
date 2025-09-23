// src/components/consultas/SelectMedico.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useMedicosPaged } from "@/hooks/admin/useMedicosPaged";

export default function SelectMedico({
  value, onChange,
  label = "Médico (nombre completo)",
  placeholder = "Dra. María Pérez",
}: {
  value: string; onChange: (v: string) => void; label?: string; placeholder?: string;
}) {
  const [search, setSearch] = useState(value);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setSearch(value), [value]);

  const { names, loading } = useMedicosPaged({ page: 1, size: 1000, search });
  const visible = useMemo(() => names.slice(0, 8), [names]);

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
          onBlur={() => { setTimeout(() => setOpen(false), 60); }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
            if (e.key === "Enter" && visible[0]) {
              onChange(visible[0]);
              setSearch(visible[0]);
              setOpen(false);
            }
          }}
          placeholder={placeholder}
          autoComplete="off"
        />

        {open && (
          <div className="absolute z-20 mt-1 w-full max-h-56 overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
            {loading && <div className="px-3 py-2 text-sm text-slate-500">Cargando…</div>}
            {!loading && visible.length === 0 && (
              <div className="px-3 py-2 text-sm text-slate-500">Sin resultados</div>
            )}
            {!loading && visible.map((name) => (
              <button
                key={name}                     // ← key = string (no agregamos id)
                type="button"
                className="block w-full text-left px-3 py-2 text-sm hover:bg-slate-50"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(name);
                  setSearch(name);
                  setOpen(false);
                }}
              >
                <div className="font-medium text-slate-800">{name}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </label>
  );
}
