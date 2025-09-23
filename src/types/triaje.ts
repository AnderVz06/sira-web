export type Genero = "m" | "f";

export type VitalSignUI = {
  id: number;
  fecha_registro: string | null; // <- permitir null
  temperatura: number;
  f_card: number;
  f_resp: number;
  talla: number;
  peso: number;
};

export type PacienteUI = {
  dni: string;
  nombre: string;
  apellido: string;
  edad: number;
  genero: Genero;
  paciente_hce?: string;
};
