import type { IconType } from "react-icons";

export default function SidebarItem({
  icon: Icon, // 👈 ahora recibimos el componente
  label,
  onClick,
  active = false,
  danger = false,
}: {
  icon: IconType;
  label: string;
  onClick?: () => void;
  active?: boolean;
  danger?: boolean;
}) {
  const base =
    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition text-left select-none";
  const activeCls = "bg-blue-600 text-white ring-1 ring-blue-500/50 shadow-sm";
  const hoverCls = "hover:bg-white/70 hover:ring-1 hover:ring-slate-200/70";
  const textCls = danger
    ? "text-red-600 hover:bg-red-50 hover:ring-red-200/70"
    : active
    ? ""
    : "text-slate-700";
  const iconCls = danger
    ? "text-red-600"
    : active
    ? "text-white"
    : "text-slate-500";

  return (
    <button
      onClick={onClick}
      className={[base, active ? activeCls : hoverCls, textCls].join(" ")}
    >
      <span className={`text-xl ${iconCls}`}>
        <Icon /> {/* 👈 render del icono */}
      </span>
      <span className="truncate">{label}</span>
    </button>
  );
}
