import { useMemo, useState } from "react";
import type { AccountRequest } from "@/types/accountRequests";
import {
  approveAccountRequest,
  createUserFromAccountRequest,
} from "@/service/access/accountRequests";
import { toast } from "@/components/ui/Toast";

export function UserTable({
  rows,
  selected,
  onToggleRow,
  allOnPageSelected,
  onToggleAllOnPage,
  onAfterAction,
}: {
  rows: AccountRequest[];
  selected: Record<number, boolean>;
  onToggleRow: (id: number, checked: boolean) => void;
  allOnPageSelected: boolean;
  onToggleAllOnPage: (checked: boolean) => void;
  onAfterAction?: () => void;
}) {
  const [creatingId, setCreatingId] = useState<number | null>(null);
  const [genUser, setGenUser] = useState("");
  const [genPass, setGenPass] = useState("");

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // Marca local de aprobados (optimista)
  const [approvedNow, setApprovedNow] = useState<Record<number, boolean>>({});

  const byId = useMemo(() => {
    const map: Record<number, AccountRequest> = {};
    rows.forEach((r) => (map[r.id] = r));
    return map;
  }, [rows]);

  const isApproved = (r: AccountRequest) => {
    const st = (r.status || "").toLowerCase();
    return st === "approved" || st === "aprobado" || approvedNow[r.id] === true;
  };

  // ---------------- helpers ----------------
  /** Normaliza: quita acentos, a minúsculas, permite letras/números y '.' */
  const slugifyDot = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")       // quitar diacríticos
      .toLowerCase()
      .replace(/[^a-z0-9.]+/g, "")          // solo letras/números/punto
      .replace(/\.+/g, ".")                  // colapsar múltiples puntos
      .replace(/^\.+|\.+$/g, "")             // quitar puntos al inicio/fin
      .slice(0, 32);

  /** Username derivado del NOMBRE: nombre.apellido */
  const deriveUsernameFromName = (r: AccountRequest) => {
    const parts = (r.full_name || "").trim().split(/\s+/).filter(Boolean);
    const first = parts[0] || "";
    const last = parts.length > 1 ? parts[parts.length - 1] : "";
    let composed = "";

    if (first && last) composed = `${first}.${last}`;
    else if (first || last) composed = (first || last)!;
    else composed = `user${String(r.id).slice(-3)}`;

    let candidate = slugifyDot(composed);
    if (!candidate.includes(".") && first && last) {
      // Si por limpieza se perdió el punto, reintenta forzar patrón
      candidate = slugifyDot(`${first}.${last}`);
    }
    if (candidate.length < 4) candidate = `user${String(r.id).slice(-3)}`;
    return candidate;
  };

  const getRandomInt = (max: number) => {
    const a = new Uint32Array(1);
    crypto.getRandomValues(a);
    return a[0] % max;
  };

  const shuffle = (arr: string[]) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = getRandomInt(i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const generatePassword = (len = 12) => {
    const upp = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const low = "abcdefghijkmnopqrstuvwxyz";
    const num = "23456789";
    const sym = "!@#$%^&*()-_=+[]{}";
    const req = [
      upp[getRandomInt(upp.length)],
      low[getRandomInt(low.length)],
      num[getRandomInt(num.length)],
      sym[getRandomInt(sym.length)],
    ];
    const all = upp + low + num + sym;
    const rest: string[] = [];
    for (let i = req.length; i < len; i++) rest.push(all[getRandomInt(all.length)]);
    return shuffle([...req, ...rest]).join("");
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copiado al portapapeles");
    } catch {
      toast.error("No se pudo copiar");
    }
  };

  // ---------------- acciones ----------------
  const openCreate = (id: number) => {
    const r = byId[id];
    if (!r) return;
    setCreatingId(id);
    setErr("");
    setGenUser(deriveUsernameFromName(r)); // ← nombre.apellido
    setGenPass(generatePassword(12));
  };

  /** Regenera manteniendo patrón nombre.apellido con sufijo numérico */
  const regenUser = () => {
    if (creatingId == null) return;
    const r = byId[creatingId];
    if (!r) return;
    const base = deriveUsernameFromName(r); // nombre.apellido
    const candidate = `${base}`;
    setGenUser(slugifyDot(candidate));
  };

  const regenPass = () => setGenPass(generatePassword(12));

  const submitCreate = async () => {
    if (!creatingId) return;
    if (!genUser || !genPass) {
      setErr("No se pudo generar credenciales, intente nuevamente.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      const res = await createUserFromAccountRequest(creatingId, {
        username: genUser,
        password: genPass,
      });
      setCreatingId(null); // cierra modal
      toast.success(res?.message || "Usuario creado exitosamente"); // <- usa el mensaje del back
      onAfterAction?.(); // <- refresca la lista/paginación
    } catch (e: any) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        e?.message ||
        "No se pudo crear el usuario";
      setErr(String(msg));
      toast.error(String(msg));
    } finally {
      setBusy(false);
    }
  };

  const doApprove = async (id: number) => {
    setBusy(true);
    setErr("");
    try {
      const res = await approveAccountRequest(id); // { message }
      setApprovedNow((map) => ({ ...map, [id]: true }));
      toast.success(res?.message || "Solicitud aprobada.");
      onAfterAction?.();
    } catch (e: any) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        e?.message ||
        "No se pudo aprobar";
      setErr(String(msg));
      toast.error(String(msg));
    } finally {
      setBusy(false);
    }
  };

  // ---------------- render ----------------
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-slate-600">
            <th className="px-2 py-2">
              <input
                type="checkbox"
                checked={allOnPageSelected}
                onChange={(e) => onToggleAllOnPage(e.target.checked)}
              />
            </th>
            <th className="px-2 py-2">Nombre</th>
            <th className="px-2 py-2">Correo</th>
            <th className="px-2 py-2">Rol</th>
            <th className="px-2 py-2">Área</th>
            <th className="px-2 py-2">Motivo</th>
            <th className="px-2 py-2">Estado</th>
            <th className="px-2 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const approved = isApproved(r);
            return (
              <tr key={r.id} className="border-t border-slate-200">
                <td className="px-2 py-2 align-top">
                  <input
                    type="checkbox"
                    checked={!!selected[r.id]}
                    onChange={(e) => onToggleRow(r.id, e.target.checked)}
                  />
                </td>
                <td className="px-2 py-2 align-top">{r.full_name}</td>
                <td className="px-2 py-2 align-top">{r.email}</td>
                <td className="px-2 py-2 align-top capitalize">{r.requested_role}</td>
                <td className="px-2 py-2 align-top">{r.area}</td>
                <td className="px-2 py-2 align-top max-w-[280px]">
                  <span className="line-clamp-2">{r.motivo}</span>
                </td>
                <td className="px-2 py-2 align-top">
                  {approved ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                      Aprobado
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
                      Pendiente
                    </span>
                  )}
                </td>
                <td className="px-2 py-2 align-top">
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-white hover:bg-emerald-700 disabled:opacity-60"
                      onClick={() => doApprove(r.id)}
                      disabled={busy || approved}
                      title={approved ? "Ya está aprobado" : "Aprobar solicitud"}
                    >
                      Aprobar
                    </button>
                    <button
                      className="rounded-lg bg-blue-600 px-2.5 py-1.5 text-white hover:bg-blue-700 disabled:opacity-60"
                      onClick={() => openCreate(r.id)}
                      disabled={busy || !approved}
                      title={approved ? "Crear usuario para esta solicitud" : "Primero apruebe la solicitud"}
                    >
                      Crear usuario
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr>
              <td colSpan={8} className="px-2 py-6 text-center text-slate-500">
                Sin resultados
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal crear usuario */}
      {creatingId !== null && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-xl">
            <h3 className="text-base font-semibold text-slate-800">Crear usuario</h3>
            <p className="mt-1 text-xs text-slate-500">ID solicitud: {creatingId}</p>
            {err && (
              <div className="mt-2 rounded-lg border border-rose-200 bg-rose-50 p-2 text-xs text-rose-700">
                {err}
              </div>
            )}

            <div className="mt-3 space-y-3">
              {/* Username autogenerado (nombre.apellido) */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Usuario</label>
                <div className="flex gap-2">
                  <input
                    value={genUser}
                    readOnly
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm bg-slate-50"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(genUser)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
                  >
                    Copiar
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Formato: <code>nombre.apellido</code> (sin acentos). “Regenerar” añade un sufijo numérico.
                </p>
              </div>

              {/* Password autogenerada */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Contraseña</label>
                <div className="flex gap-2">
                  <input
                    value={genPass}
                    readOnly
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm bg-slate-50"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(genPass)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
                  >
                    Copiar
                  </button>
                  <button
                    type="button"
                    onClick={() => setGenPass(generatePassword(12))}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
                  >
                    Regenerar
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Incluye mayúsculas, minúsculas, números y símbolos.
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setCreatingId(null)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-60"
                disabled={busy}
              >
                Cancelar
              </button>
              <button
                onClick={submitCreate}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-60"
                disabled={busy}
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
