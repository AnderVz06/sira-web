import { useEffect, useState } from "react";

type ToastKind = "success" | "error" | "info";
type ToastItem = { id: number; kind: ToastKind; message: string; timeout: number };

let TOASTS: ToastItem[] = [];
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

function push(kind: ToastKind, message: string, timeout = 3000) {
  const id = Date.now() + Math.random();
  TOASTS = [...TOASTS, { id, kind, message, timeout }];
  notify();
  window.setTimeout(() => {
    TOASTS = TOASTS.filter((t) => t.id !== id);
    notify();
  }, timeout);
}

export const toast = {
  success: (msg: string, timeout?: number) => push("success", msg, timeout),
  error: (msg: string, timeout?: number) => push("error", msg, timeout),
  info: (msg: string, timeout?: number) => push("info", msg, timeout),
};

export function ToastContainer() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const l = () => setTick((v) => v + 1);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);

  return (
    <div className="pointer-events-none fixed top-4 right-4 z-[9999] flex w-full max-w-sm flex-col gap-2">
      {TOASTS.map((t) => (
        <div
          key={t.id}
          className={[
            "pointer-events-auto rounded-xl border px-3 py-2 text-sm shadow-lg backdrop-blur",
            t.kind === "success" && "border-emerald-200 bg-emerald-50 text-emerald-800",
            t.kind === "error" && "border-rose-200 bg-rose-50 text-rose-800",
            t.kind === "info" && "border-sky-200 bg-sky-50 text-sky-800",
          ].filter(Boolean).join(" ")}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
