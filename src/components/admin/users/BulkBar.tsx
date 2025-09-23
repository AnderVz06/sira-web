export function BulkBar({
  count,
  onClear,
  onDelete,
}: {
  count: number;
  onClear: () => void;
  onDelete: () => void;
}) {
  if (count === 0) return null;
  return (
    <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
      <div>
        <strong>{count}</strong> seleccionado(s)
      </div>
      <div className="flex gap-2">
        <button
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 hover:bg-slate-50"
          onClick={onClear}
        >
          Limpiar
        </button>
        <button
          className="rounded-lg bg-rose-600 px-3 py-1.5 text-white hover:bg-rose-700"
          onClick={onDelete}
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
