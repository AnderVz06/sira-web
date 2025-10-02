import { useNavigate, useLocation } from "react-router-dom";
import { FiUser, FiLogOut } from "react-icons/fi";
import SidebarItem from "./SidebarItem";
import Divider from "./Divider";
import { getMainNav, getAdminNav, type RoleId } from "./nav";
import { getRoleId, clearSession } from "@/service/session";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const roleFromSession = getRoleId();
  const role: RoleId =
    roleFromSession === 1 || roleFromSession === 2 || roleFromSession === 3
      ? (roleFromSession as RoleId)
      : 0;

  const logout = () => {
    clearSession();
    try { sessionStorage.removeItem("auth_had_session"); } catch {}
    navigate("/"); // ajusta si corresponde
  };

  const mainItems = getMainNav(role);
  const adminItems = getAdminNav(role);
  const isAdmin = role === 1;

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-white/80 backdrop-blur-md border border-slate-200/70 shadow-2xl rounded-2xl z-20">
      <div className="mx-3 mt-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 shadow-md p-4 text-center">
        <div className="text-lg font-bold tracking-wide text-white drop-shadow-sm">SIRA</div>
        <p className="mt-0.5 text-xs font-medium text-blue-100">Salud Respiratoria</p>
      </div>

      <nav className="flex-1 mt-4 px-3 space-y-3 text-sm font-medium">
        {mainItems.map((item) => (
          <SidebarItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            active={location.pathname.startsWith(item.path)}
            onClick={() => navigate(item.path)}
          />
        ))}
      </nav>

      <div className="mb-4 space-y-3 border-t border-slate-200/70 pt-4 px-3 text-sm font-medium">
        {adminItems.map((item) => (
          <SidebarItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            active={location.pathname.startsWith(item.path)}
            onClick={() => navigate(item.path)}
          />
        ))}

        {isAdmin && <Divider />}

        <SidebarItem
          icon={FiUser}
          label="Perfil"
          active={location.pathname.startsWith("/perfil")}
          onClick={() => navigate("/perfil")}
        />
        <SidebarItem icon={FiLogOut} label="Cerrar Sesión" onClick={logout} />
      </div>
    </aside>
  );
};

export default Sidebar;
