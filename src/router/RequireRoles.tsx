// src/router/RequireRoles.tsx
import { ReactNode, useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { isAuthenticated, getRoleId } from "@/service/session";

function getLandingRoute(roleId: number | null): string {
  switch (roleId ?? 0) {
    case 1: return "/registro-personal"; // admin
    case 2: return "/consultas-medico";  // enfermero (ajusta a tu mapa real)
    case 3: return "/triaje";            // médico
    default: return "/";
  }
}

function RedirectBackOr({ to }: { to: string }) {
  const navigate = useNavigate();
  useEffect(() => {
    if (window.history.length > 1) navigate(-1);
    else navigate(to, { replace: true });
  }, [navigate, to]);
  return null;
}

export default function RequireRoles({
  allowed,
  children,
}: {
  allowed: number[];
  children: ReactNode;
}) {
  const location = useLocation();

  if (!isAuthenticated()) {
    return (
      <Navigate
        to="/auth-required"
        replace
        state={{
          from: {
            pathname: location.pathname,
            search: location.search,
            hash: location.hash,
          },
        }}
      />
    );
  }

  const roleId = getRoleId();
  const isAllowed = roleId != null && allowed.includes(roleId);

  if (!isAllowed) {
    const fallback = getLandingRoute(roleId);
    return <RedirectBackOr to={fallback} />;
  }

  return <>{children}</>;
}
