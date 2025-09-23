// src/pages/auth/LoginPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";
import login from "@/service/auth/login";
import { saveSession } from "@/service/session";

function getLandingRoute(roleId: number): string {
  switch (roleId) {
    case 1: return "/registro-personal"; // admin
    case 2: return "/consultas-medico";         // enfermero (o según tu mapa)
    case 3: return "/triaje";            // médico (o según tu mapa)
    default: return "/";                 // fallback
  }
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <LoginForm
      username={username}
      password={password}
      showPassword={showPassword}
      remember={remember}
      loading={loading}
      error={error}
      onUsernameChange={setUsername}
      onPasswordChange={setPassword}
      onToggleShowPassword={() => setShowPassword((v) => !v)}
      onToggleRemember={() => setRemember((v) => !v)}
      onSubmit={async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
          const data = await login({ username, password });
          // Guarda token/role/username (tu saveSession ya no depende de "remember")
          saveSession(data);

          const roleId = Number(data?.role_id);
          const to = getLandingRoute(roleId);
          navigate(to, { replace: true });
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
      }}
      onRequestAccess={() => navigate("/access-request")}
    />
  );
}
