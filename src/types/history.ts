export interface HistorialItem {
  paciente_dni: string;
  paciente_nombre: string;
  edad: number;
  f_resp: number;                 // frecuencia respiratoria
  peso: number;
  motivo_consulta: string;
  indicaciones: string;
  notas: string;
  fecha_registro: string;         // ISO 8601 ("2025-09-13T17:05:19")
  temperatura: number;
  id: number;
  f_card: number;                 // frecuencia cardíaca
  talla: number;                  // en metros (1.75)
  genero: "m" | "f" | string;     // dejo abierto por si agregan otros valores
  examenfisico: string;
  medicamentos: string;
  resultado_diagnostico: string;
}

/** Respuesta del endpoint */
export type HistorialResponse = HistorialItem;