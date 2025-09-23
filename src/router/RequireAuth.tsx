// src/routes/RequireAuth.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isAuthenticated } from "@/service/session"; // ajusta la ruta de import

export default function RequireAuth({ children }: { children?: React.ReactNode }) {
  const location = useLocation();

  if (!isAuthenticated()) {
    return (
      <Navigate
        to="/auth-required"
        state={{ from: { pathname: location.pathname, search: location.search, hash: location.hash } }}
        replace
      />
    );
  }

  return children ? <>{children}</> : <Outlet />;
}
