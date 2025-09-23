import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiEye, FiEyeOff, FiLock, FiShield, FiCheck } from "react-icons/fi";
import { changePassword } from "@/service/user/users"; // existente
import { getMe } from "@/service/auth/login"; // creado arriba


// helpers de fortaleza (idénticos a tu lógica original)
function scorePassword(pw: string) {
    let score = 0;
    if (!pw) return 0;
    const letters: Record<string, number> = {};
    for (const c of pw) letters[c] = (letters[c] || 0) + 1;
    for (const k in letters) score += letters[k] * 4;
    const variations = {
        digits: /\d/.test(pw),
        lower: /[a-z]/.test(pw),
        upper: /[A-Z]/.test(pw),
        nonWords: /[^A-Za-z0-9]/.test(pw),
        length8: pw.length >= 8,
        length12: pw.length >= 12,
    } as const;
    let variationCount = 0;
    for (const check in variations) variationCount += (variations as any)[check] ? 1 : 0;
    score += (variationCount - 1) * 10;
    if (pw.length < 8) score = Math.min(score, 20);
    return Math.max(0, Math.min(100, score));
}


function strengthLabel(score: number) {
    if (score >= 80) return { label: "Muy fuerte", color: "bg-emerald-500", ring: "ring-emerald-200", text: "text-emerald-700" };
    if (score >= 60) return { label: "Fuerte", color: "bg-green-500", ring: "ring-green-200", text: "text-green-700" };
    if (score >= 40) return { label: "Media", color: "bg-yellow-500", ring: "ring-yellow-200", text: "text-yellow-700" };
    if (score >= 20) return { label: "Débil", color: "bg-orange-500", ring: "ring-orange-200", text: "text-orange-700" };
    return { label: "Muy débil", color: "bg-red-500", ring: "ring-red-200", text: "text-red-700" };
}

export default function CambiarContrasenaPageCentrado() {
    const navigate = useNavigate();


    // estado del formulario
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");


    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);


    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);


    // estado de /me
    const [meLoading, setMeLoading] = useState(true);
    const [meError, setMeError] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null);


    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setMeLoading(true);
                const me = await getMe();
                if (!mounted) return;
                setUserId(me.id);
            } catch (e: any) {
                if (!mounted) return;
                const msg = e?.response?.data?.message || e?.message || "No se pudo obtener el usuario";
                setMeError(msg);
            } finally {
                if (mounted) setMeLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    const score = useMemo(() => scorePassword(newPassword), [newPassword]);
    const { label, color, ring, text } = strengthLabel(score);


    const rules = useMemo(() => ([
        { ok: newPassword.length >= 8, text: "Mínimo 8 caracteres" },
        { ok: /[A-Z]/.test(newPassword), text: "Al menos 1 mayúscula" },
        { ok: /[a-z]/.test(newPassword), text: "Al menos 1 minúscula" },
        { ok: /\d/.test(newPassword), text: "Al menos 1 número" },
        { ok: /[^A-Za-z0-9]/.test(newPassword), text: "Algún símbolo (p.ej. !@#)" },
    ]), [newPassword]);


    const validate = () => {
        if (!currentPassword) return "Ingresa tu contraseña actual";
        if (!newPassword) return "Ingresa una nueva contraseña";
        if (newPassword.length < 8) return "La nueva contraseña debe tener al menos 8 caracteres";
        if (!/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword) || !/\d/.test(newPassword))
            return "Usa mayúsculas, minúsculas y un número";
        if (newPassword !== confirmPassword) return "Las contraseñas no coinciden";
        if (newPassword === currentPassword) return "La nueva contraseña no puede ser igual a la actual";
        return null;
    };


    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const v = validate();
        if (v) { setError(v); return; }
        if (!userId) { setError("No se pudo determinar el usuario actual"); return; }
        setError(null);
        setSubmitting(true);
        try {
            await changePassword(userId, { old_password: currentPassword, new_password: newPassword });
            setSuccess(true);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            const apiMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message;
            setError(apiMsg || "No se pudo cambiar la contraseña");
        } finally {
            setSubmitting(false);
        }
    };


    // bloquear el submit mientras cargamos /me
    const disabled = submitting || meLoading || !userId;

    return (
        <div className="min-h-screen w-full relative flex items-center justify-center p-4 bg-gradient-to-b from-slate-50 via-slate-50 to-white overflow-hidden">
            {/* decoraciones suaves */}
            <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-200/30 blur-3xl" />


            {/* Overlay de envío */}
            {(submitting || meLoading) && (
                <div className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm grid place-content-center">
                    <div className="rounded-2xl bg-white px-6 py-4 ring-1 ring-slate-200 shadow">
                        <div className="animate-pulse text-slate-700">{meLoading ? "Cargando usuario…" : "Guardando cambios…"}</div>
                    </div>
                </div>
            )}


            <div className="w-full max-w-xl">
                <div className="relative rounded-3xl bg-white/80 backdrop-blur-sm ring-1 ring-slate-200 shadow-xl">
                    {/* HERO compacto */}
                    <header className="px-6 md:px-8 pt-6 pb-4">
                        <div className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-500 p-5 flex items-center gap-4 shadow-lg ring-1 ring-white/20">
                            <div className="h-12 w-12 rounded-xl bg-white text-blue-700 grid place-content-center shadow">
                                <FiShield className="h-6 w-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h1 className="text-2xl font-extrabold text-white truncate">Cambiar contraseña</h1>
                            </div>
                        </div>
                    </header>


                    {/* FORM */}
                    <main className="p-6 md:p-8">
                        {meError && (
                            <div className="mb-4 rounded-xl bg-red-50 text-red-700 text-sm p-3 ring-1 ring-red-100">{meError}</div>
                        )}
                        <form className="space-y-6" onSubmit={onSubmit}>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium text-slate-700">Contraseña actual</label>
                                <div className="relative">
                                    <input
                                        type={showCurrent ? "text" : "password"}
                                        className="w-full h-12 px-4 rounded-2xl border border-slate-300 focus:border-blue-500 focus:ring-blue-500 pr-12 shadow-sm"
                                        placeholder="••••••••"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        autoComplete="current-password"
                                        disabled={disabled}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrent((s) => !s)}
                                        className="absolute inset-y-0 right-3 my-auto text-slate-500 hover:text-slate-700"
                                        aria-label="Mostrar u ocultar contraseña actual"
                                        disabled={disabled}
                                    >
                                        {showCurrent ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium text-slate-700">Nueva contraseña</label>
                                <div className="relative">
                                    <input
                                        type={showNew ? "text" : "password"}
                                        className="w-full h-12 px-4 rounded-2xl border border-slate-300 focus:border-blue-500 focus:ring-blue-500 pr-12 shadow-sm"
                                        placeholder="Mínimo 8 caracteres"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        autoComplete="new-password"
                                        disabled={disabled}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNew((s) => !s)}
                                        className="absolute inset-y-0 right-3 my-auto text-slate-500 hover:text-slate-700"
                                        aria-label="Mostrar u ocultar nueva contraseña"
                                        disabled={disabled}
                                    >
                                        {showNew ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>


                                <div className={`mt-2 rounded-xl p-3 ring-1 ${ring} bg-slate-50`}>
                                    <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                                        <div className={`h-full ${color}`} style={{ width: `${Math.max(6, score)}%`, transition: "width .3s ease" }} />
                                    </div>
                                    <div className={`mt-2 text-xs flex items-center gap-2 ${text}`}>
                                        <FiLock />
                                        <span>Fortaleza: {label}</span>
                                    </div>
                                </div>


                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mt-2">
                                    {rules.map((r) => (
                                        <li key={r.text} className={`flex items-center gap-2 rounded-lg px-2 py-1 ring-1 ${r.ok ? "ring-emerald-200 bg-emerald-50 text-emerald-700" : "ring-slate-200 bg-white text-slate-600"}`}>
                                            <span className={`h-4 w-4 rounded-full grid place-content-center ${r.ok ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"}`}>
                                                <FiCheck className="h-3 w-3" />
                                            </span>
                                            {r.text}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium text-slate-700">Confirmar nueva contraseña</label>
                                <div className="relative">
                                    <input
                                        type={showConfirm ? "text" : "password"}
                                        className="w-full h-12 px-4 rounded-2xl border border-slate-300 focus:border-blue-500 focus:ring-blue-500 pr-12 shadow-sm"
                                        placeholder="Repite la nueva contraseña"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        autoComplete="new-password"
                                        disabled={disabled}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm((s) => !s)}
                                        className="absolute inset-y-0 right-3 my-auto text-slate-500 hover:text-slate-700"
                                        aria-label="Mostrar u ocultar confirmación"
                                        disabled={disabled}
                                    >
                                        {showConfirm ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                            </div>


                            {error && (
                                <div className="rounded-xl bg-red-50 text-red-700 text-sm p-3 ring-1 ring-red-100">{error}</div>
                            )}


                            <div className="flex items-center justify-between gap-3 pt-2">
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-2 px-4 h-11 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50"
                                    onClick={() => navigate(-1)}
                                    disabled={disabled}
                                >
                                    <FiArrowLeft /> Volver
                                </button>


                                <button
                                    type="submit"
                                    className="px-5 h-11 rounded-xl bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={disabled}
                                >
                                    Guardar contraseña
                                </button>
                            </div>
                        </form>
                    </main>
                </div>
                <div className="text-center text-xs text-slate-500 mt-4">Consejo: usa un gestor de contraseñas y evita reutilizarlas.</div>
            </div>


            {success && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm grid place-content-center p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 ring-1 ring-slate-200 shadow-xl">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 grid place-content-center">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-2.59a.75.75 0 1 0-1.22-.88l-3.236 4.49L9.53 11.47a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.28Z" clipRule="evenodd" /></svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">¡Contraseña actualizada!</h3>
                                <p className="text-sm text-slate-600">Tu contraseña se cambió correctamente.</p>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button className="px-4 h-10 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50" onClick={() => setSuccess(false)}>Cerrar</button>
                            <button className="px-4 h-10 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700" onClick={() => { setSuccess(false); navigate(-1); }}>Volver</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}