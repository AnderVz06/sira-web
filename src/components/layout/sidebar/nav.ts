// nav.ts (puede ser .ts)
import { FiHome, FiUsers, FiActivity, FiShield, FiUserPlus } from "react-icons/fi";
import type { IconType } from "react-icons";

export type RoleId = 0 | 1 | 2 | 3;

export type NavItem = {
  path: string;
  label: string;
  icon: IconType;
};

export function getMainNav(role: RoleId): NavItem[] {
  return [
    ...(role === 1 || role === 3 ? [{ path: "/consultas",     label: "Consultas",          icon: FiUsers }] : []),
    ...(role === 2  ? [{ path: "/consultas-medico",     label: "Consultas",          icon: FiUsers }] : []),
    ...(role === 1 || role === 3 ? [{ path: "/triaje",        label: "Triaje",             icon: FiActivity }] : []),
  ];
}

export function getAdminNav(role: RoleId): NavItem[] {
  const isAdmin = role === 1;
  return [
    ...(isAdmin ? [{ path: "/admin-usuarios",    label: "Admin Usuarios",    icon: FiShield }] : []),
    ...(isAdmin ? [{ path: "/registro-personal", label: "Registrar Personal", icon: FiUserPlus }] : []),
  ];
}
