import { HiOutlineDocumentReport, HiOutlineAnnotation, HiOutlineClipboardList } from "react-icons/hi";
import { FiTrash2, FiEdit2 } from "react-icons/fi";
import type { Block } from "@/hooks/history/useBloques";

export default function BlockCard({
  block,
  onDelete,
  onEdit, // ← nuevo (opcional)
}: {
  block: Block;
  onDelete: () => void;
  onEdit?: () => void;
}) {
  const fecha = new Date(block.createdAt).toLocaleString();

  if (block.type === "diagnostico") {
    const { motivo, examen, diagnostico, signos } = block.payload;
    return (
      <div className="rounded-2xl ring-1 ring-amber-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h4 className="text-amber-700 font-semibold flex items-center gap-2">
            <HiOutlineDocumentReport /> Diagnóstico preliminar •{" "}
            <span className="font-normal text-slate-500">{fecha}</span>
          </h4>
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="px-2 py-1 rounded-md bg-slate-50 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                title="Editar"
              >
                <FiEdit2 />
              </button>
            )}
            <button
              onClick={onDelete}
              className="px-2 py-1 rounded-md bg-red-50 text-red-700 ring-1 ring-red-200 hover:bg-red-100"
              title="Eliminar"
            >
              <FiTrash2 />
            </button>
          </div>
        </div>

        <div className="mt-3 grid gap-3">
          <ItemLine label="Motivo" value={motivo || "—"} />
          <ItemLine label="Examen Físico" value={examen || "—"} />

          {diagnostico?.trim() && (
            <div className="bg-amber-50/60 ring-1 ring-amber-200 rounded-xl p-3">
              <strong className="text-amber-800">Impresión:</strong>
              <pre className="whitespace-pre-wrap text-slate-800 text-sm mt-1">{diagnostico}</pre>
            </div>
          )}

          {signos && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-sm">
              <Chip label="Temp" value={fmt(signos.temperatura, "°C")} />
              <Chip label="FC" value={fmt(signos.f_card, "bpm")} />
              <Chip label="FR" value={fmt(signos.f_resp, "rpm")} />
              <Chip label="Talla" value={fmt(signos.talla, "m")} />
              <Chip label="Peso" value={fmt(signos.peso, "kg")} />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (block.type === "receta") {
    const { medicamentos } = block.payload;
    return (
      <div className="rounded-2xl ring-1 ring-blue-200 bg-white p-4 font-sans">
        <div className="flex items-center justify-between">
          <h4 className="text-blue-700 font-semibold">
            Receta • <span className="font-normal text-slate-500">{fecha}</span>
          </h4>
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="px-2 py-1 rounded-md bg-slate-50 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                title="Editar"
              >
                <FiEdit2 />
              </button>
            )}
            <button
              onClick={onDelete}
              className="px-2 py-1 rounded-md bg-red-50 text-red-700 ring-1 ring-red-200 hover:bg-red-100"
              title="Eliminar"
            >
              <FiTrash2 />
            </button>
          </div>
        </div>

        <div className="mt-3">
          {/* Encabezados (opcional) */}
          <div className="hidden md:grid grid-cols-1 md:grid-cols-12 gap-2 text-xs text-slate-500 px-2 pb-1">
            <div className="md:col-span-4">Medicamento</div>
            <div className="md:col-span-4">Dosis</div>
            <div className="md:col-span-4">Frecuencia</div>
          </div>

          <ul className="space-y-2">
            {medicamentos.map((m, i) => (
              <li
                key={i}
                className="bg-blue-50/60 ring-1 ring-blue-200 rounded-lg px-3 py-2"
              >
                {/* En móviles se ven las etiquetas; en desktop queda en columnas */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                  <div className="md:col-span-4">
                    <div className="md:hidden text-xs text-slate-500">Medicamento</div>
                    <div className="text-slate-500">{m.nombre}</div>
                  </div>
                  <div className="md:col-span-4">
                    <div className="md:hidden text-xs text-slate-500">Dosis</div>
                    <div className="text-slate-700">{m.dosis}</div>
                  </div>
                  <div className="md:col-span-4">
                    <div className="md:hidden text-xs text-slate-500">Frecuencia</div>
                    <div className="text-slate-700">{m.frecuencia}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (block.type === "indicaciones") {
    const { indicaciones } = block.payload;
    return (
      <div className="rounded-2xl ring-1 ring-teal-200 bg-white p-4 font-sans">
        <div className="flex items-center justify-between">
          <h4 className="text-teal-700 font-semibold flex items-center gap-2">
            <HiOutlineClipboardList /> Indicaciones •{" "}
            <span className="font-normal text-slate-500">{fecha}</span>
          </h4>
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="px-2 py-1 rounded-md bg-slate-50 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                title="Editar"
              >
                <FiEdit2 />
              </button>
            )}
            <button
              onClick={onDelete}
              className="px-2 py-1 rounded-md bg-red-50 text-red-700 ring-1 ring-red-200 hover:bg-red-100"
              title="Eliminar"
            >
              <FiTrash2 />
            </button>
          </div>
        </div>

        <div className="mt-3">
          {/* Forzamos sans también aquí para evitar monospace por defecto del <pre> */}
          <pre className="whitespace-pre-wrap text-slate-800 font-normal font-sans">
            {indicaciones}
          </pre>
        </div>
      </div>
    );
  }


  // notas
 const { notas } = block.payload as Extract<Block, { type: "notas" }>["payload"];
return (
  <div className="rounded-2xl ring-1 ring-violet-200 bg-white p-4 font-sans">
    <div className="flex items-center justify-between">
      <h4 className="text-violet-700 font-semibold flex items-center gap-2">
        <HiOutlineAnnotation /> Notas •{" "}
        <span className="font-normal text-slate-500">
          {new Date(block.createdAt).toLocaleString()}
        </span>
      </h4>
      <div className="flex items-center gap-2">
        {onEdit && (
          <button
            onClick={onEdit}
            className="px-2 py-1 rounded-md bg-slate-50 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
            title="Editar"
          >
            <FiEdit2 />
          </button>
        )}
        <button
          onClick={onDelete}
          className="px-2 py-1 rounded-md bg-red-50 text-red-700 ring-1 ring-red-200 hover:bg-red-100"
          title="Eliminar"
        >
          <FiTrash2 />
        </button>
      </div>
    </div>
    <div className="mt-3">
      <pre className="whitespace-pre-wrap text-slate-800 font-normal font-sans">
        {notas}
      </pre>
    </div>
  </div>
);

}

const ItemLine = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-white ring-1 ring-slate-200 rounded-lg p-3">
    <span className="text-slate-500 text-xs">{label}</span>
    <p className="text-slate-800 text-sm">{value}</p>
  </div>
);

const Chip = ({ label, value }: { label: string; value: string | number }) => (
  <div className="px-3 py-2 rounded-xl text-center ring-1 bg-amber-50 text-amber-800 ring-amber-200">
    <div className="text-[11px] uppercase tracking-wide opacity-70">{label}</div>
    <div className="text-sm font-semibold">{value}</div>
  </div>
);

const fmt = (v?: number, suf?: string) => (v ?? "—") + (v != null && suf ? ` ${suf}` : "");
