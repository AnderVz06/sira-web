import { FiCheckCircle, FiAlertTriangle, FiInfo } from "react-icons/fi";

type AlertKind = "success" | "error" | "info";

export default function Alert({
  kind = "info",
  children,
  className = "",
}: {
  kind?: AlertKind;
  children: React.ReactNode;
  className?: string;
}) {
  const styles =
    kind === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : kind === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-blue-200 bg-blue-50 text-blue-700";

  const Icon = kind === "success" ? FiCheckCircle : kind === "error" ? FiAlertTriangle : FiInfo;

  return (
    <div className={`mb-4 flex items-start gap-2 rounded-xl border px-3 py-2 text-sm ${styles} ${className}`}>
      <Icon className="mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
