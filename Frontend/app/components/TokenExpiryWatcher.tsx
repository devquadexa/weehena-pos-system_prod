"use client";

import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import { useRouter, usePathname } from "next/navigation";

interface JwtPayload {
  exp: number;
}

const MAX_TIMEOUT = 2_147_483_647;

export default function TokenExpiryWatcher() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const logout = (showToast: boolean) => {
      localStorage.removeItem("token");
      if (showToast) toast.error("Session expired. Please login again.");
      router.replace("/auth/login");
    };

    let timer: ReturnType<typeof setTimeout> | undefined;

    try {
      const { exp } = jwtDecode<JwtPayload>(token);
      const remaining = exp * 1000 - Date.now();

      if (remaining <= 0) {
        logout(true);
        return;
      }

      timer = setTimeout(() => logout(true), Math.min(remaining, MAX_TIMEOUT));
    } catch {
      logout(false);
      return;
    }

    return () => clearTimeout(timer);
  }, [router, pathname]);

  return null;
}
