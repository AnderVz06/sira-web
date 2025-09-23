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
      <input
        placeholder="Buscar por nombre, correo, área o motivo…"
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
      />
      <select
        value={rol}
        onChange={(e) => onRol(e.target.value as any)}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
      >
        <option value="todos">Todos</option>
        <option value="enfermero">Enfermero</option>
        <option value="medico">Médico</option>
      </select>
    </div>
  );
}
