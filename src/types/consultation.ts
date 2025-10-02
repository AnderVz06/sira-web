export type ConsultaPayload = {
  status: string;
  dni: string;
  user_fullname_medic: string;
  edit_status?: boolean;
  dia: number;
  hora: number;
  minuto: number;
};

export type Consulta = Partial<{
  id: number;
  created_at: string;

  // campos del backend:
  paciente_hce: string;
  paciente_nombre: string;
  paciente_apelido: string;   // (typo que a veces llega)
  paciente_apellido: string;

  anio: number;
  mes: number;    // 1..12
  dia: number;
  hora: number;
  minuto: number;

  status: "En espera" | "Terminado" | "Cancelado";
  edit_status: boolean;
}> & ConsultaPayload;

export type Status = "En espera" | "Terminado" | "Cancelado";

export type ConsultaUI = {
  id: number;
  nombre: string;
  apellido: string;
  edit_status?: boolean;
  hce: string;
  dni: string;
  estado: Status;
  llegada: string; // ISO
  cita: string;    // ISO
  medico?: string;
};
