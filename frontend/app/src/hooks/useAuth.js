import { useState, useEffect, useCallback } from "react";

function getStoredAuth() {
  try {
    const token = localStorage.getItem("bookverse-token");
    const userStr = localStorage.getItem("bookverse-user");
    const user = userStr ? JSON.parse(userStr) : null;
    return { token, user, isLoggedIn: Boolean(token && user) };
  } catch {
    return { token: null, user: null, isLoggedIn: false };
  }
}

export function useAuth() {
  const [authState, setAuthState] = useState(getStoredAuth);

  const refreshAuth = useCallback(() => {
    setAuthState(getStoredAuth());
  }, []);

  useEffect(() => {
    const handleAuthChange = () => {
      refreshAuth();
    };

    window.addEventListener("bookverse-auth-change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("bookverse-auth-change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, [refreshAuth]);

  const login = useCallback((token, user) => {
    localStorage.setItem("bookverse-token", token);
    localStorage.setItem("bookverse-user", JSON.stringify(user));
    window.dispatchEvent(new Event("bookverse-auth-change"));
    setAuthState({ token, user, isLoggedIn: true });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("bookverse-token");
    localStorage.removeItem("bookverse-user");
    window.dispatchEvent(new Event("bookverse-auth-change"));
    setAuthState({ token: null, user: null, isLoggedIn: false });
  }, []);

  return {
    user: authState.user,
    token: authState.token,
    isLoggedIn: authState.isLoggedIn,
    login,
    logout,
    refreshAuth,
  };
}
