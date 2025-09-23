import { useState } from "react";
import type { Genero } from "@/types/triaje";
import type { PacientePayload } from "@/types/patient";

export default function AgregarPacienteModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (nuevo: PacientePayload) => void | Promise<void>;
}) {
  // Básicos visibles
  const [dni, setDni] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [edad, setEdad] = useState<number | "">("");
  const [genero, setGenero] = useState<Genero>("m");

  // Extras opcionales (ocultos por defecto)
  const [showExtras, setShowExtras] = useState(false);
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ocupacion, setOcupacion] = useState("");
  const [fecha_nacimiento, setFechaNacimiento] = useState("");
  const [grupo_sanguineo, setGrupoSanguineo] = useState("");
  const [seguro_social, setSeguroSocial] = useState("");
  const [estado_civil, setEstadoCivil] = useState("");
  const [alergias, setAlergias] = useState("");
  const [antedecentes_medicos, setAntecedentesMedicos] = useState("");
  const [antecedentes_familiares, setAntecedentesFamiliares] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    setErr("");

    const edadNum = typeof edad === "string" || edad === null ? NaN : edad;
    if (!dni.trim() || !nombre.trim() || !apellido.trim()) {
      setErr("DNI, nombre y apellido son obligatorios.");
      return;
    }
    if (!/^\d{6,12}$/.test(dni.trim())) {
      setErr("Ingresa un DNI válido (6–12 dígitos).");
      return;
    }
    if (!Number.isFinite(edadNum) || edadNum < 0) {
      setErr("Ingresa una edad válida (número ≥ 0).");
      return;
    }

    const payload: PacientePayload = {
      dni: dni.trim(),
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      edad: edadNum,
      genero,

      // Extras (queden o no vacíos)
      direccion: direccion.trim(),
      telefono: telefono.trim(),
      ocupacion: ocupacion.trim(),
      fecha_nacimiento,
      grupo_sanguineo,
      seguro_social,
      estado_civil,
      alergias: alergias.trim(),
      antedecentes_medicos: antedecentes_medicos.trim(),
      antecedentes_familiares: antecedentes_familiares.trim(),
    };

    try {
      setLoading(true);
      await onSuccess(payload);
    } catch (e: any) {
      setErr(e?.message || "No se pudo crear el paciente");
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void submit();
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 backdrop-blur-[1px] p-4">
      <div
        className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200"
        onKeyDown={onKeyDown}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white">
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-white text-blue-700 grid place-content-center font-extrabold shadow">
              NP
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-extrabold leading-tight truncate">Nuevo paciente</h3>
              <p className="text-blue-100 text-xs">Completa los datos básicos. Los demás son opcionales.</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {err && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {err}
            </div>
          )}

          {/* Datos personales (básicos) */}
          <fieldset className="rounded-xl ring-1 ring-slate-200 bg-gradient-to-br from-slate-50 to-white px-4 py-3">
            <legend className="px-1 text-sm font-semibold text-slate-800">Datos personales</legend>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <LabeledInput
                label="DNI"
                placeholder="12345678"
                value={dni}
                onChange={(v) => setDni(v.replace(/\D+/g, "").slice(0, 8))} // ← solo dígitos, máx 8
                inputMode="numeric"
                pattern="\d{8}"
                maxLength={8}
                autoFocus
              />
              <LabeledInput label="Nombre" placeholder="Juan" value={nombre} onChange={setNombre} />
              <LabeledInput label="Apellido" placeholder="Pérez" value={apellido} onChange={setApellido} />
            </div>
          </fieldset>

          {/* Demográficos (básicos) */}
          <fieldset className="rounded-xl ring-1 ring-slate-200 bg-gradient-to-br from-slate-50 to-white px-4 py-3">
            <legend className="px-1 text-sm font-semibold text-slate-800">Demográficos</legend>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <LabeledInput
                label="Edad"
                placeholder="35"
                value={edad === "" ? "" : String(edad)}
                onChange={(v) => setEdad(v === "" ? "" : Number(v))}
                type="number"
                min="0"
                inputMode="numeric"
              />
              <LabeledSelect
                label="Género"
                value={genero}
                onChange={(v) => setGenero(v as Genero)}
                options={[
                  { value: "m", label: "Masculino" },
                  { value: "f", label: "Femenino" },
                ]}
              />
              {/* Botón para mostrar/ocultar extras */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => setShowExtras((s) => !s)}
                  className={[
                    "w-full h-10 rounded-xl text-sm font-semibold shadow-sm transition",
                    showExtras
                      ? "bg-slate-200 text-slate-800 hover:bg-slate-300"
                      : "bg-white ring-1 ring-slate-200 hover:bg-slate-50 text-slate-700",
                  ].join(" ")}
                >
                  {showExtras ? "Ocultar datos opcionales" : "Añadir datos opcionales"}
                </button>
              </div>
            </div>
          </fieldset>

          {/* Sección opcional colapsable */}
          {showExtras && (
            <div className="space-y-5 animate-[fadeIn_200ms_ease-out]">
              {/* Demográficos extra */}
              <fieldset className="rounded-xl ring-1 ring-slate-200 bg-gradient-to-br from-slate-50 to-white px-4 py-3">
                <legend className="px-1 text-sm font-semibold text-slate-800">Demográficos (opcional)</legend>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <LabeledSelect
                    label="Estado civil"
                    value={estado_civil}
                    onChange={setEstadoCivil}
                    options={[
                      { value: "", label: "No especifica" },
                      { value: "soltero", label: "Soltero(a)" },
                      { value: "casado", label: "Casado(a)" },
                      { value: "conviviente", label: "Conviviente" },
                      { value: "divorciado", label: "Divorciado(a)" },
                      { value: "viudo", label: "Viudo(a)" },
                    ]}
                  />
                  <LabeledInput
                    label="Fecha de nacimiento"
                    value={fecha_nacimiento}
                    onChange={setFechaNacimiento}
                    type="date"
                    placeholder="1990-05-21"
                  />
                  <div />
                </div>
              </fieldset>

              {/* Contacto */}
              <fieldset className="rounded-xl ring-1 ring-slate-200 bg-gradient-to-br from-slate-50 to-white px-4 py-3">
                <legend className="px-1 text-sm font-semibold text-slate-800">Contacto (opcional)</legend>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <LabeledInput
                    label="Dirección"
                    placeholder="Av. Siempre Viva 742"
                    value={direccion}
                    onChange={setDireccion}
                  />
                  <LabeledInput
                    label="Teléfono"
                    placeholder="999123456"
                    value={telefono}
                    onChange={setTelefono}
                    inputMode="tel"
                  />
                  <LabeledInput
                    label="Ocupación"
                    placeholder="Docente"
                    value={ocupacion}
                    onChange={setOcupacion}
                  />
                </div>
              </fieldset>

              {/* Información clínica y seguro */}
              <fieldset className="rounded-xl ring-1 ring-slate-200 bg-gradient-to-br from-slate-50 to-white px-4 py-3">
                <legend className="px-1 text-sm font-semibold text-slate-800">
                  Información clínica y seguro (opcional)
                </legend>

                <div className="mt-2 grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <LabeledSelect
                    label="Grupo sanguíneo"
                    value={grupo_sanguineo}
                    onChange={setGrupoSanguineo}
                    options={[
                      { value: "", label: "No especifica" },
                      { value: "A+", label: "A+" }, { value: "A-", label: "A-" },
                      { value: "B+", label: "B+" }, { value: "B-", label: "B-" },
                      { value: "AB+", label: "AB+" }, { value: "AB-", label: "AB-" },
                      { value: "O+", label: "O+" }, { value: "O-", label: "O-" },
                    ]}
                  />
                  <LabeledSelect
                    label="Seguro social"
                    value={seguro_social}
                    onChange={setSeguroSocial}
                    options={[
                      { value: "", label: "No especifica" },
                      { value: "ESSALUD", label: "EsSalud" },
                      { value: "SIS", label: "SIS" },
                      { value: "PRIVADO", label: "Privado" },
                      { value: "NINGUNO", label: "Ninguno" },
                    ]}
                  />
                  <div className="sm:col-span-2" />
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <LabeledTextarea
                    label="Alergias"
                    placeholder="Penicilina, mariscos…"
                    value={alergias}
                    onChange={setAlergias}
                    rows={2}
                  />
                  <LabeledTextarea
                    label="Antecedentes personales"
                    placeholder="Hipertensión, DM2…"
                    value={antedecentes_medicos}
                    onChange={setAntecedentesMedicos}
                    rows={2}
                  />
                  <LabeledTextarea
                    label="Antecedentes familiares"
                    placeholder="Cardiopatías, cáncer…"
                    value={antecedentes_familiares}
                    onChange={setAntecedentesFamiliares}
                    rows={2}
                  />
                </div>
              </fieldset>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={submit}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Inputs base */
function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  min,
  inputMode,
  autoFocus,
  pattern,
  maxLength
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
  min?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoFocus?: boolean;
  pattern?: string;    
  maxLength?: number; 
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-700">{label}</span>
      <div className="flex items-center gap-2 rounded-xl ring-1 ring-slate-200 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500/60 shadow-sm">
        <input
          className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none"
          type={type}
          min={min}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          autoFocus={autoFocus}
        />
      </div>
    </label>
  );
}

function LabeledSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-700">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-full rounded-xl ring-1 ring-slate-200 bg-white px-3 pr-9 text-sm shadow-sm focus:ring-2 focus:ring-blue-500/60"
        >
          {options.map((op) => (
            <option key={op.value} value={op.value}>
              {op.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
          ▾
        </span>
      </div>
    </label>
  );
}

function LabeledTextarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-700">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-xl ring-1 ring-slate-200 bg-white px-3 py-2 text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 resize-none"
      />
    </label>
  );
}
