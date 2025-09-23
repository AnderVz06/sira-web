export type ConsultaPayload = {
  status: string;
  dni: string;
  user_fullname_medic: string;
  dia: number;
  hora: number;
  minuto: number;
};

/** Estructura base (ajústala si tu backend retorna más campos) */
export type Consulta = Partial<{
  id: number;
  created_at: string;

  // campos del backend:
  paciente_hce: string;
  paciente_nombre: string;
  paciente_apelido: string;   // <- tal como llega hoy (con typo)
  paciente_apellido: string;  // <- por si lo corrigen mañana

  anio: number;
  mes: number;     // 1..12 (según tu ejemplo: 9 = setiembre)
  dia: number;
  hora: number;
  minuto: number;
}> & ConsultaPayload;

export type Status = "En espera" | "Terminado" | "Cancelado";

export type ConsultaUI = {
  id: number;
  nombre: string;
  apellido: string;
  hce: string;
  dni: string;
  estado: Status;
  llegada: string; // ISO
  cita: string;    // ISO
  medico?: string;
};
