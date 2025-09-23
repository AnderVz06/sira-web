import { useState } from "react";

/** Herramienta activa */
export type Tool = "receta" | "indicaciones" | "diagnostico" | "notas" | null;

/** Bloques del constructor */
export type Block =
  | {
      id: string;
      type: "diagnostico";
      createdAt: string;
      payload: {
        motivo: string;
        examen: string;
        diagnostico?: string;
        signos?: {
          temperatura?: number;
          f_card?: number;
          f_resp?: number;
          talla?: number;
          peso?: number;
        };
      };
    }
  | {
      id: string;
      type: "receta";
      createdAt: string;
      payload: {
        medicamentos: { nombre: string; dosis: string; frecuencia: string }[];
        indicaciones?: string; // indicaciones desde la receta
      };
    }
  | {
      id: string;
      type: "indicaciones";
      createdAt: string;
      payload: {
        indicaciones: string; // apartado de indicaciones general
      };
    }
  | {
      id: string;
      type: "notas";
      createdAt: string;
      payload: {
        notas: string;
      };
    };

export function useBloques() {
  const [accion, setAccion] = useState<Tool>(null);
  const [bloques, setBloques] = useState<Block[]>([]);

  const agregarBloque = (b: Block) => setBloques((prev) => [b, ...prev]);
  const eliminarBloque = (id: string) => setBloques((prev) => prev.filter((b) => b.id !== id));
  const limpiarBloques = () => setBloques([]);

  return { accion, setAccion, bloques, agregarBloque, eliminarBloque, limpiarBloques };
}
