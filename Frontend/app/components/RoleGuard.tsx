"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserFromToken } from "../services/userService";
import toast from "react-hot-toast";

export default function RoleGuard({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles: string[];
}) {
  const router = useRouter();

  useEffect(() => {
    const user = getUserFromToken();

    if (!user || !user.role || !allowedRoles.includes(user.role)) {
      toast.error("Unauthorized Role");
      router.push("/auth/login");
    }
  }, [router, allowedRoles]);

  return <>{children}</>;
}
