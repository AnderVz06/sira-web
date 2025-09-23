export function BulkBar({
  count,
  onClear,
  onApprove,
}: {
  count: number;
  onClear: () => void;
  onApprove: () => void; // aprobar seleccionados
}) {
  if (count <= 0) return null;
  return (
    <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
      <span>
        {count} seleccionad{count === 1 ? "o" : "os"}
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={onApprove}
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700"
        >
          Aprobar seleccionados
        </button>
        <button
          onClick={onClear}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 hover:bg-slate-50"
        >
          Limpiar
        </button>
      </div>
    </div>
  );
}
