import type { ReactNode } from "react";

export default function IconAction({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="h-11 w-11 rounded-full bg-white/90 text-blue-700 shadow hover:shadow-md grid place-content-center"
      title={label}
      aria-label={label}
    >
      {icon}
    </button>
  );
}
