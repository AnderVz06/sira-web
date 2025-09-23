import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "./useAuth";

type GuardOptions = {
  redirectTo?: string;     // ruta a donde enviar si no cumple (default: "/login")
  requireAdmin?: boolean;  // si true, exige role_id = 1
};

export default function useAuthGuard(options?: GuardOptions) {
  const { authenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const redirectTo = options?.redirectTo ?? "/login";

  useEffect(() => {
    if (!authenticated) {
      navigate(redirectTo, { replace: true });
      return;
    }
    if (options?.requireAdmin && !isAdmin) {
      navigate("/", { replace: true }); // o a una página 403
    }
  }, [authenticated, isAdmin, navigate, redirectTo, options?.requireAdmin]);
}
