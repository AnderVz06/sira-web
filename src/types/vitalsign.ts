export type Genero = "m" | "f" | string;

export type VitalSignPayload = {
  temperatura: number;
  f_card: number;
  f_resp: number;
  talla: number;
  peso: number;
  dni: string; // DNI del paciente
};

// Estructura esperada en respuestas.
// Ajusta si tu API devuelve otra forma.
export type VitalSign = VitalSignPayload & {
  id: number;
  dni: string;
  paciente_hce: string;
  edad: number;
  f_resp: number;
  peso: number;
  imc: number;
  temperatura: number;
  f_card: number;
  talla: number;
  genero: Genero;
  /** El backend lo envía como ISO string; permitimos null por seguridad */
  fecha_registro: string | null;
};
