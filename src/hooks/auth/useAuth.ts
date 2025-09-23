import { useMemo } from "react";
import {
getToken,
getUsername,
getRoleId,
clearSession
}
from "@/service/session";


function parseJwt(token: string): any | null {
    try {
        const payload = token.split(".")[1];
        return JSON.parse(atob(payload));
    } catch {
        return null;
    }
}

function isTokenExpired(token: string | null): boolean {
    if (!token) return true;
    const payload = parseJwt(token);
    const exp = payload?.exp; // epoch seconds
    if (!exp) return false;   // si no hay exp, no forzamos expiración del lado cliente
    const now = Math.floor(Date.now() / 1000);
    return now >= exp;
}

export default function useAuth() {
    const token = getToken();
    const username = getUsername();
    const roleId = getRoleId();

    const authenticated = useMemo(() => !isTokenExpired(token), [token]);
    const isAdmin = roleId === 1;

    const logout = () => clearSession();

    return {
        token,
        username,
        roleId,
        authenticated,
        isAdmin,
        logout,
    };
}
