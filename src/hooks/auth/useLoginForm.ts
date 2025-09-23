import { useCallback, useState, FormEvent } from "react";
import type { LoginFormProps } from "@/components/auth/LoginForm";
import login from "@/service/auth/login";
import { saveSession } from "@/service/session";

type Options = {
  onSuccess?: () => void;       // p.ej. navigate("/")
  onRequestAccess?: () => void; // opcional: reemplaza el alert por algo propio
};

export default function useLoginForm(options?: Options): LoginFormProps {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onUsernameChange = useCallback((v: string) => setUsername(v), []);
  const onPasswordChange = useCallback((v: string) => setPassword(v), []);
  const onToggleShowPassword = useCallback(() => setShowPassword((s) => !s), []);
  const onToggleRemember = useCallback(() => setRemember((s) => !s), []);

  const onSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);
      try {
        const data = await login({ username, password });
        saveSession(data);
        options?.onSuccess?.();
      } catch (err: any) {
        const msg =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          "No se pudo iniciar sesión";
        setError(String(msg));
      } finally {
        setLoading(false);
      }
    },
    [username, password, remember, options]
  );

  const onRequestAccess = useCallback(() => {
    if (options?.onRequestAccess) return options.onRequestAccess();
    alert("Contacte al administrador para solicitar acceso.");
  }, [options]);

  return {
    username,
    password,
    showPassword,
    remember,
    loading,
    error,
    onUsernameChange,
    onPasswordChange,
    onToggleShowPassword,
    onToggleRemember,
    onSubmit,
    onRequestAccess,
  };
}
