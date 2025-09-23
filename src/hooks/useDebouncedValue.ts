import { useEffect, useState } from "react";

/**
 * Devuelve el `value` con un retraso (debounce) de `delay` ms.
 * Útil para evitar disparar requests en cada tecla del buscador.
 *
 * Ejemplo:
 * const debouncedQuery = useDebouncedValue(query, 350);
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

export default useDebouncedValue;
