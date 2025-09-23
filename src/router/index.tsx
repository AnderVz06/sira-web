import { createBrowserRouter } from "react-router-dom";
import App from "@/app/App";
import LoginPage from "@/pages/auth/LoginPage";
import AccessRequestPage from "@/pages/access/AccessRequestPage";
import AdminSolicitudesContainer from "@/pages/admin/account-requests/AdminUsuariosContainer";
import AdminUsuariosContainer from "@/pages/admin/users/AdminUsuariosContainer";
import TriajeContainer from "@/pages/triaje/TriajeContainer";
import ConsultasHoyContainer from "@/pages/consultas/ConsultasHoyContainer";
import ConsultasMedicoContainer from "@/pages/consultas/ConsultasMedicoContainer";
import RealizarConsultaPage from "@/pages/hce/RealizarConsultaPage";
import CambiarContrasenaPage from "@/pages/auth/CambiarContrasena";
import PerfilPage from "@/pages/perfil/PerfilPage";
import RequireAuth from "@/router/RequireAuth";
import AuthRequiredPage from "@/pages/auth/AuthRequiredPage";

const router = createBrowserRouter([
  // Público
  { path: "/", element: <LoginPage /> },
  { path: "/access-request", element: <AccessRequestPage /> },
  { path: "/auth-required", element: <AuthRequiredPage /> }, // pantalla aviso

  // Protegido
  {
    path: "/",
    element: (
      <RequireAuth>
        <App />
      </RequireAuth>
    ),
    children: [
      { path: "/registro-personal", element: <AdminSolicitudesContainer /> },
      { path: "/admin-usuarios", element: <AdminUsuariosContainer /> },
      { path: "/triaje", element: <TriajeContainer /> },
      { path: "/consultas", element: <ConsultasHoyContainer /> },
      { path: "/consultas-medico", element: <ConsultasMedicoContainer /> },
      { path: "/realizar-Consulta/:dni", element: <RealizarConsultaPage /> },
      { path: "/cambiar-contraseña", element: <CambiarContrasenaPage /> },
      { path: "/perfil", element: <PerfilPage /> },
    ],
  },
]);

export default router;
