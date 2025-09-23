import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AccessRequestForm from "@/components/access/AccessRequestForm";
import useAccessRequestForm from "@/hooks/access/useAccessRequestForm";
import { toast, ToastContainer } from "@/components/ui/Toast"; // 👈 named imports

export default function AccessRequestPage() {
  const navigate = useNavigate();
  const { ok, error, ...formProps } = useAccessRequestForm({ onBack: () => navigate(-1) });

  useEffect(() => {
    if (ok) {
      toast.success("¡Solicitud enviada! Te contactaremos al correo indicado.");
    }
  }, [ok]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <>
      {/* Monta este contenedor SOLO si no lo tienes ya en App/Layout */}
      <ToastContainer />
      <AccessRequestForm {...formProps} />
    </>
  );
}
