"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-white text-red-800">
        <div className="mb-6 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-red-800"></div>

        <h1 className="text-xl font-bold">WEEHENA FARM SHOP</h1>

        <p className="mt-2 font-semibold text-red-800">
          Authenticating user...
        </p>
      </div>
    );
  }
  return children;
}
