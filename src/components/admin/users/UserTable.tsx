import type { User } from "@/types/user";

export function UserTable({
  rows,
  selected,
  onToggleRow,
  allOnPageSelected,
  onToggleAllOnPage,
}: {
  rows: User[];
  selected: Record<number, boolean>;
  onToggleRow: (id: number, checked: boolean) => void;
  allOnPageSelected: boolean;
  onToggleAllOnPage: (checked: boolean) => void;
}) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-slate-600">
            <th className="px-2 py-2">
              <input
                type="checkbox"
                checked={allOnPageSelected}
                onChange={(e) => onToggleAllOnPage(e.target.checked)}
              />
            </th>
            <th className="px-2 py-2">Nombre</th>
            <th className="px-2 py-2">Usuario</th>
            <th className="px-2 py-2">Correo</th>
            <th className="px-2 py-2">Rol</th>
            <th className="px-2 py-2">Área</th>
            <th className="px-2 py-2">Estado</th>
            <th className="px-2 py-2">Último acceso</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((u) => (
            <tr key={u.id} className="border-t border-slate-200">
              <td className="px-2 py-2">
                <input
                  type="checkbox"
                  checked={!!selected[u.id]}
                  onChange={(e) => onToggleRow(u.id, e.target.checked)}
                />
              </td>
              <td className="px-2 py-2">{u.full_name}</td>
              <td className="px-2 py-2">{u.username}</td>
              <td className="px-2 py-2">{u.email}</td>
              <td className="px-2 py-2">
                {u.role_id === 1 ? "Admin" : u.role_id === 2 ? "Enfermero" : "Médico"}
              </td>
              <td className="px-2 py-2">{u.area}</td>
              <td className="px-2 py-2">
                {u.enabled ? (
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                    Activo
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                    Inactivo
                  </span>
                )}
              </td>
              <td className="px-2 py-2">
                {u.ultimo_accesso ? new Date(u.ultimo_accesso).toLocaleString() : "—"}
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={8} className="px-2 py-6 text-center text-slate-500">
                Sin resultados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
