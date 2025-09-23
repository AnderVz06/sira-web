export default function Pagination({
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
    <div className="px-6 md:px-0 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="text-sm text-slate-600">
        Total: <span className="font-semibold">{totalItems}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          disabled={page === 1}
          className="h-9 px-3 rounded-lg ring-1 ring-slate-200 text-sm font-medium shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:bg-slate-50"
        >
          ← Anterior
        </button>
        <div className="px-2 text-sm text-slate-700">
          Página <span className="font-semibold">{page}</span> / {totalPages}
        </div>
        <button
          onClick={onNext}
          disabled={page === totalPages}
          className="h-9 px-3 rounded-lg ring-1 ring-slate-200 text-sm font-medium shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:bg-slate-50"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}
