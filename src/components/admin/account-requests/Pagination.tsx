export function Pagination({
  page,
  totalPages,
  totalItems,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="mt-4 flex items-center justify-between text-sm">
      <div className="text-slate-600">
        {totalItems} resultado{totalItems === 1 ? "" : "s"} • Página {page} de {totalPages}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 hover:bg-slate-50 disabled:opacity-50"
          disabled={page <= 1}
        >
          Anterior
        </button>
        <button
          onClick={onNext}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 hover:bg-slate-50 disabled:opacity-50"
          disabled={page >= totalPages}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
