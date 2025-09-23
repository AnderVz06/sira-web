import { FiSearch, FiFilter } from "react-icons/fi";

export function Toolbar({
  query,
  onQuery,
  rol,
  onRol,
}: {
  query: string;
  onQuery: (v: string) => void;
  rol: "todos" | "admin" | "medico" | "enfermero";
  onRol: (v: "todos" | "admin" | "medico" | "enfermero") => void;
}) {
  return (
    <div className="flex flex-col md:flex-row gap-3 md:items-center">
      <div className="flex-1 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
        <FiSearch className="text-slate-400" />
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Buscar por nombre, usuario o correo…"
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
        <FiFilter className="text-slate-400" />
        <select
          value={rol}
          onChange={(e) => onRol(e.target.value as any)}
          className="bg-transparent text-sm outline-none"
        >
          <option value="todos">Todos</option>
          <option value="admin">Admin</option>
          <option value="medico">Médico</option>
          <option value="enfermero">Enfermero</option>
        </select>
      </div>
    </div>
  );
}
