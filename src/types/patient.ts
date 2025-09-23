export type PacientePayload = {
  dni: string;
  nombre: string;
  apellido: string;
  edad: number;
  genero: string;
  direccion: string;
  telefono: string;
  ocupacion: string;
  fecha_nacimiento: string;
  grupo_sanguineo: string;
  seguro_social: string;
  estado_civil: string;
  alergias: string;
  antedecentes_medicos: string;     // <- tal cual lo enviaste (con esa grafía)
  antecedentes_familiares: string;
};

/** Tipo de respuesta base (ajústalo si tu backend devuelve otros campos) */
export type Paciente = PacientePayload & {
  paciente_hce?: string;
  id?: number;
  created_at?: string | null;
  updated_at?: string | null;
};