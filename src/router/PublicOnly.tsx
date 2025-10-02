// src/router/PublicOnly.tsx
import { Navigate } from "react-router-dom";
import { isAuthenticated, getRoleId } from "@/service/session";

// centraliza tu landing por rol:
function getLandingRoute(roleId: number | null | undefined): string {
  switch (Number(roleId) || 0) {
    case 1: return "/registro-personal";  // admin
    case 2: return "/consultas-medico";   // médico
    case 3: return "/triaje";             // enfermero (o "/consultas")
    default: return "/";
  }
}

export default function PublicOnly({ children }: { children: React.ReactNode }) {
  if (isAuthenticated()) {
    return <Navigate to={getLandingRoute(getRoleId())} replace />;
  }
  return <>{children}</>;
}
