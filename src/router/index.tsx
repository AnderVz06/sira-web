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
import RequireRoles from "@/router/RequireRoles"; // ⬅️ nuevo
import AuthRequiredPage from "@/pages/auth/AuthRequiredPage";
import SessionExpiredPage from "@/pages/auth/SessionExpiredPage";
import { consultaActivaLoader } from "./loaders/consultaActivaLoader";
import RouteErrorBoundary from "./RouteErrorBoundary";
import PublicOnly from "./PublicOnly";
import NoBack from "./NoBack";

const router = createBrowserRouter([
  // Público
  { path: "/", element: <PublicOnly><LoginPage /></PublicOnly> },
  { path: "/access-request", element: <AccessRequestPage /> },
  { path: "/auth-required", element: <AuthRequiredPage /> },   // sin sesión al entrar por link
  { path: "/session-expired", element: <SessionExpiredPage /> }, // sesión expirada (401/403)

  // Protegido (layout principal)
  {
    path: "/",
    element: (
      <RequireAuth>
        <App />
      </RequireAuth>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      // SOLO ADMIN (1)
      {
        path: "/registro-personal",
        element: (
          <RequireRoles allowed={[1]}>
            <AdminSolicitudesContainer />
          </RequireRoles>
        ),
      },
      {
        path: "/admin-usuarios",
        element: (
          <RequireRoles allowed={[1]}>
            <AdminUsuariosContainer />
          </RequireRoles>
        ),
      },

      // ENFERMERO (2) + ADMIN (1)
      {
        path: "/triaje",
        element: (
          <RequireRoles allowed={[1, 3]}>
            <NoBack><TriajeContainer /></NoBack>
          </RequireRoles>
        ),
      },
      {
        path: "/consultas",
        element: (
          <RequireRoles allowed={[1, 3]}>
            <NoBack><ConsultasHoyContainer /></NoBack>
          </RequireRoles>
        ),
      },

      // MÉDICO (3) + ADMIN (1)
      {
        path: "/consultas-medico",
        element: (
          <RequireRoles allowed={[1, 2]}>
            <NoBack><ConsultasMedicoContainer /></NoBack>
          </RequireRoles> 
        ),
      },

      // Rutas generales (cualquier rol autenticado)
      {
        path: "/realizar-Consulta/:dni",
        loader: consultaActivaLoader,
        element: (
          <RequireRoles allowed={[1, 2]}>
            <RealizarConsultaPage />,
          </RequireRoles>
        ),
      },
      { path: "/cambiar-contraseña", element: <CambiarContrasenaPage /> },
      { path: "/perfil", element: <PerfilPage /> },
    ],
  },
]);

export default router;
