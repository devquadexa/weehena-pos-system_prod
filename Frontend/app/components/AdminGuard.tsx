"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserFromToken } from "../services/userService";
import toast from "react-hot-toast";

export default function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const user = getUserFromToken();

    if (!user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
      toast.error("Unauthorized Role");
      router.push("/auth/login");
    }
  }, [router]);

  return <div>{children}</div>;
}
