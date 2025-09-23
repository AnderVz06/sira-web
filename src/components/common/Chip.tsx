export default function Chip({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="px-3 py-2 rounded-xl text-center ring-1 bg-amber-50 text-amber-800 ring-amber-200">
      <div className="text-[11px] uppercase tracking-wide opacity-70">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}
