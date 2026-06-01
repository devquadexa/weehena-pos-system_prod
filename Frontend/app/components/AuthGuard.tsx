"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AuthGuardProps = {
  children: ReactNode;
};

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/auth/login");
      } else {
        setLoading(false);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <p className="text-center font-semibold text-red-900 ">
          Checking authentication...
        </p>
      </div>
    );
  }
  return children;
}
