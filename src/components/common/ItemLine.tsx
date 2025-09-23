export default function ItemLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white ring-1 ring-slate-200 rounded-lg p-3">
      <span className="text-slate-500 text-xs">{label}</span>
      <p className="text-slate-800 text-sm">{value}</p>
    </div>
  );
}
