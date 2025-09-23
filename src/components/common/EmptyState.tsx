export default function EmptyState({
  title,
  desc,
  actionLabel,
  onAction,
}: {
  title: string;
  desc?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="grid place-content-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      {desc && <p className="mt-1 text-sm text-slate-600">{desc}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
