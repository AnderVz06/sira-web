import { HiOutlineDocumentReport, HiOutlineCalendar, HiOutlineClock, HiOutlineAnnotation, HiOutlineDocumentSearch } from "react-icons/hi";
import { BsThermometerHalf, BsWind } from "react-icons/bs";
import { HistorialItem } from "@/types/history";
import { clasificarIMC } from "../../utils/format";
import { formatearFecha, calcularAntiguedad } from "@/utils/dates";
import Badge from "../common/Badge";

export default function HistorialCard({ item, index }: { item: HistorialItem; index: number }) {
  const imc = item.peso / (item.talla * item.talla);
  const estadoIMC = clasificarIMC(imc);
  const meds = item.medicamentos ? item.medicamentos.split(/\s*,\s*/).filter(Boolean) : [];

  return (
    <div className="border-l-4 border-blue-500 p-5 bg-blue-50/70 rounded-2xl shadow-sm space-y-4 ring-1 ring-blue-200">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
          <HiOutlineDocumentReport size={24} />
        </div>
        <div className="min-w-0">
          <h3 className="text-blue-800 text-lg font-extrabold">Consulta #{index + 1}</h3>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-700 mt-1">
            <span className="inline-flex items-center gap-1">
              <HiOutlineCalendar className="text-blue-700" /> {formatearFecha(item.fecha_registro)}
            </span>
            <span className="inline-flex items-center gap-1">
              <HiOutlineClock className="text-blue-700" /> {calcularAntiguedad(item.fecha_registro)}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl ring-1 ring-blue-200 p-4 text-center">
        <h3 className="text-blue-900 text-lg font-bold">{item.resultado_diagnostico}</h3>
      </div>

      <div>
        <h4 className="text-blue-800 text-sm font-semibold mb-2">Indicadores</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <Badge label="Peso" value={`${item.peso} kg`} tone="blue" />
          <Badge label="Talla" value={`${item.talla} m`} tone="indigo" />
          <Badge
            label="IMC"
            value={`${Number.isFinite(imc) ? imc.toFixed(1) : "—"} (${Number.isFinite(imc) ? estadoIMC : "—"})`}
            tone={estadoIMC === "Normal" ? "emerald" : "amber"}
          />
          <Badge
            label="Temp"
            value={`${item.temperatura}°C`}
            tone={item.temperatura >= 38 ? "red" : "sky"}
            icon={<BsThermometerHalf size={16} />}
          />
        </div>
      </div>

      <div>
        <h4 className="text-blue-800 text-sm font-semibold flex items-center gap-2">Signos Vitales</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm mt-2">
          <div className="bg-red-100 text-red-700 px-2 py-1 rounded-lg text-center font-semibold flex items-center justify-center gap-1 ring-1 ring-red-200">
            <BsThermometerHalf size={16} /> {item.temperatura}°C
          </div>
          <div className="bg-pink-100 text-pink-700 px-2 py-1 rounded-lg text-center font-semibold flex items-center justify-center gap-1 ring-1 ring-pink-200">
            ❤ {item.f_card} bpm
          </div>
          <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-center font-semibold flex items-center justify-center gap-1 ring-1 ring-blue-200">
            <BsWind size={16} /> {item.f_resp} rpm
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <h4 className="text-blue-800 text-sm font-semibold flex items-center gap-2 mb-1">
          <HiOutlineAnnotation size={18} /> Motivo de Consulta
        </h4>
        <p className="text-sm text-slate-700">{item.motivo_consulta}</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <h4 className="text-blue-800 text-sm font-semibold flex items-center gap-2 mb-1">
          <HiOutlineDocumentSearch size={18} /> Examen Físico
        </h4>
        <p className="text-sm text-slate-700">{item.examenfisico}</p>
      </div>

      {item.indicaciones ? (
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h4 className="text-blue-800 text-sm font-semibold mb-1">Indicaciones</h4>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{item.indicaciones}</p>
        </div>
      ) : null}

      {meds.length ? (
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h4 className="text-blue-800 text-sm font-semibold mb-2">Medicamentos</h4>
          <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
            {meds.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        </div>
      ) : null}

      {item.notas ? (
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h4 className="text-blue-800 text-sm font-semibold mb-1">Notas</h4>
          <p className="text-sm text-slate-700">{item.notas}</p>
        </div>
      ) : null}
    </div>
  );
}
