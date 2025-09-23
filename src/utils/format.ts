export const initials = (n: string, a: string) =>
  `${(n?.[0] || "").toUpperCase()}${(a?.[0] || "").toUpperCase()}`;

export const clasificarIMC = (imc: number) => {
  if (imc < 18.5) return "Bajo peso";
  if (imc < 25) return "Normal";
  if (imc < 30) return "Sobrepeso";
  return "Obesidad";
};

export const fmt = (v?: number, suf?: string) => (v ?? "—") + (v != null && suf ? ` ${suf}` : "");
