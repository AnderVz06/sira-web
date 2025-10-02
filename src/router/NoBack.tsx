import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Evita que el usuario pueda volver con el botón "Back" mientras este componente esté montado.
 * No es posible deshabilitar el hardware back al 100% en todos los navegadores,
 * pero este patrón neutraliza la navegación hacia atrás reinyectando el estado actual.
 */
export default function NoBack({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Reemplaza la entrada actual (quita la anterior del stack)
    navigate(location.pathname + location.search + location.hash, { replace: true });

    // Neutraliza el popstate mientras esté montado
    const onPopState = (e: PopStateEvent) => {
      e.preventDefault?.();
      // Recoloca en la misma URL para impedir salir hacia atrás
      navigate(0); // recarga suave de la ruta actual
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [navigate, location.pathname, location.search, location.hash]);

  return <>{children}</>;
}
