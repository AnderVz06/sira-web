// src/router/RouteErrorBoundary.tsx
import { useEffect } from "react";
import { isRouteErrorResponse, useRouteError, useNavigate } from "react-router-dom";
import { getRoleId } from "@/service/session";
import { getLandingRoute } from "@/utils/roles";
import { isAuthzErrorMessage } from "@/service/httpErrors";

export default function RouteErrorBoundary() {
  const err = useRouteError();
  const navigate = useNavigate();

  useEffect(() => {
    if (isRouteErrorResponse(err)) {
      if (err.status === 401) {
        navigate("/auth-required", { replace: true });
        return;
      }
      if (err.status === 403) {
        navigate(getLandingRoute(getRoleId()), { replace: true });
        return;
      }
    } else {
      const msg = String((err as any)?.message || "");
      if (isAuthzErrorMessage(msg)) {
        navigate(getLandingRoute(getRoleId()), { replace: true });
        return;
      }
    }
  }, [err, navigate]);

  // UI mínima mientras redirige
  return <div className="p-6 text-slate-600">Redirigiendo…</div>;
}
