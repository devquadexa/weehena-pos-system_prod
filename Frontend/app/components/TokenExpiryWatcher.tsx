"use client";

import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  exp: number;
}

export default function TokenExpiryWatcher() {
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      const decoded = jwtDecode<JwtPayload>(token);

      const expiresAt = decoded.exp * 1000;
      const timeout = expiresAt - Date.now();

      if (timeout <= 0) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      const timer = setTimeout(() => {
        alert("Session expired. Please login again.");

        localStorage.removeItem("token");
        window.location.href = "/login";
      }, timeout);

      return () => clearTimeout(timer);
    } catch {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  }, []);

  return null;
}