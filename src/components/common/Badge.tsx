import type { ReactNode } from "react";

export default function Badge({
  label,
  value,
  tone = "blue",
  icon,
}: {
  label: string;
  value: string;
  tone?: "blue" | "indigo" | "emerald" | "amber" | "red" | "sky";
  icon?: ReactNode;
}) {
  const toneMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700 ring-blue-200",
    indigo: "bg-indigo-50 text-indigo-700 ring-indigo-200",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    red: "bg-red-50 text-red-700 ring-red-200",
    sky: "bg-sky-50 text-sky-700 ring-sky-200",
  };
  return (
    <div className={`px-3 py-2 rounded-xl text-center ring-1 ${toneMap[tone]} flex flex-col items-center justify-center`}>
      <div className="text-[11px] uppercase tracking-wide opacity-70">{label}</div>
      <div className="text-sm font-semibold flex items-center gap-1">
        {icon}
        {value}
      </div>
    </div>
  );
}
