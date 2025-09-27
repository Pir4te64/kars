// src/hooks/useAuth.ts
import { useState, useEffect, useCallback } from "react";
import { login, refreshAccessToken } from "../utils/loginHelper";

const ACCESS_KEY = "BearerToken";
const REFRESH_KEY = "RefreshToken";

export function useAuth() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  // Al iniciar, restauramos tokens guardados
  useEffect(() => {
    const storedAccess = localStorage.getItem(ACCESS_KEY);
    const storedRefresh = localStorage.getItem(REFRESH_KEY);

    if(!(storedAccess && storedRefresh)) handleLogin()

    if (storedAccess) setAccessToken(storedAccess);
    if (storedRefresh) setRefreshToken(storedRefresh);
  }, []);

  // Login normal (usuario + pass → access + refresh token)
  const handleLogin = useCallback(async () => {
    try {
      const data = await login();

      if (data?.access_token && data?.refresh_token) {
        setAccessToken(data.access_token);
        setRefreshToken(data.refresh_token);
        localStorage.setItem(ACCESS_KEY, data.access_token);
        localStorage.setItem(REFRESH_KEY, data.refresh_token);
      }
      return data;
    } catch (err) {
      console.error("Login failed:", err);
      throw err;
    }
  }, []);

  // Logout → limpiar tokens
  const handleLogout = useCallback(() => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    setAccessToken(null);
    setRefreshToken(null);
  }, []);

  // Refrescar el access token usando el refresh token
  const handleRefresh = useCallback(async () => {
    if (!refreshToken) throw new Error("No hay refresh token disponible");
    
    try {
      const newData = await refreshAccessToken(refreshToken);
      if (newData?.access_token) {
        setAccessToken(newData.access_token);
        localStorage.setItem(ACCESS_KEY, newData.access_token);
      }
      return newData;
    } catch (err) {
      console.error("Error refreshing token:", err);
      throw err;
    }
  }, [refreshToken]);

  return {
    accessToken,
    refreshToken,
    isAuthenticated: !!accessToken,
    login: handleLogin,
    logout: handleLogout,
    refresh: handleRefresh,
  };
}
