"use client";

import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";

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

      console.log("Expires At:", new Date(decoded.exp * 1000));
      console.log(
        "Remaining Minutes:",
        Math.floor((decoded.exp * 1000 - Date.now()) / 1000 / 60),
      );

      if (timeout <= 0) {
        localStorage.removeItem("token");
        window.location.href = "/auth/login";
        return;
      }

      const timer = setTimeout(() => {
        toast.error("Session expired. Please login again.");

        localStorage.removeItem("token");
        window.location.href = "/auth/login";
      }, timeout);

      return () => clearTimeout(timer);
    } catch {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  }, []);

  return null;
}
