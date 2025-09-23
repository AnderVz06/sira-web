import { useState, useCallback } from "react";
import { createAccountRequest } from "@/service/access/accountRequests";
import type { AccessRoleId } from "@/types/access";
import { ROLE_ID_TO_CODE } from "@/types/access";

type Options = { onBack?: () => void };

export default function useAccessRequestForm(options?: Options) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [area, setArea] = useState("");
  const [role, setRole] = useState<AccessRoleId | "">("");
  const [reason, setReason] = useState("");

  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");

  const onBack = useCallback(() => {
    options?.onBack ? options.onBack() : window.history.back();
  }, [options]);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = useCallback(async (e) => {
    e.preventDefault();
    setError("");
    setOk(false);

    if (!name.trim() || !email.trim() || role === "" || !reason.trim()) {
      setError("Completa los campos obligatorios.");
      return;
    }

    const requestedRole = ROLE_ID_TO_CODE[role as AccessRoleId];

    setLoading(true);
    try {
      await createAccountRequest({
        full_name: name.trim(),
        email: email.trim(),
        requested_role: requestedRole,
        area: area.trim(),
        motivo: reason.trim(),
      });
      setOk(true);
      setName(""); setEmail(""); setArea(""); setRole(""); setReason("");
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "No se pudo enviar la solicitud";
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  }, [name, email, area, role, reason]);

  return {
    name, email, area, role, reason,
    loading, ok, error,
    onNameChange: setName,
    onEmailChange: setEmail,
    onAreaChange: setArea,
    onRoleChange: setRole,
    onReasonChange: setReason,
    onSubmit,
    onBack,
  };
}
