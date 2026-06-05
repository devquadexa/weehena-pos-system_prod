"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getStock } from "./services/stockService";
import { useRouter } from "next/navigation";
import AuthGuard from "./components/AuthGuard";
import { getUserFromToken, logout } from "./services/userService";

export default function Home() {
  const router = useRouter();
  const [time, setTime] = useState("");
  const [outletId, setOutletId] = useState("");
  const [outlets, setOutlets] = useState<string[]>([]);

  const user = getUserFromToken();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { timeStyle: "medium" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function loadOutlets() {
      const stock = await getStock();
      const unique = Array.from(new Set(stock.map((item) => item.outletId)));
      setOutlets(unique);
      setOutletId(unique[0] ?? "");
    }
    loadOutlets().catch(console.error);
  }, []);

  return (
    <AuthGuard>
      <div className="h-screen bg-white flex flex-col items-center justify-center">
        <div className="flex flex-col mx-aut items-center gap-2">
          <Image
            src="/weehenaLogo.png"
            alt="Weehena Farm Shop Logo"
            width={150}
            height={150}
            className="size-18"
          />
          <h1 className="text-2xl text-black font-bold">Weehena Farm Shop</h1>
          <p className="text-md text-gray-800 font-sans font-normal">
            {new Date().toLocaleDateString("en-US", { dateStyle: "full" })}
          </p>
          <p className="text-md text-gray-800 font-sans font-normal">{time}</p>
        </div>
        <div className="flex flex-col gap-4 mt-6 mx-auto items-center">
          {(user?.role === "CASHIER" ||
            user?.role === "STAFF" ||
            user?.role === "MANAGER") && (
            <>
              <label
                htmlFor="outletId"
                className="text-md text-gray-800 font-sans font-medium"
              >
                Select your outlet to start selling
              </label>
              <select
                id="outletId"
                value={outletId}
                onChange={(e) => setOutletId(e.target.value)}
                className="shadow drop-shadow-md shadow-gray-500 p-2 text-sm font-medium text-center text-white bg-red-700 rounded-xl w-56 h-10 focus:outline-none focus:ring-2 focus:ring-red-800 transition"
              >
                {outlets.map((id) => (
                  <option
                    key={id}
                    value={id}
                    className="bg-red-50 text-gray-800"
                  >
                    {id}
                  </option>
                ))}
              </select>
              <Link
                href={outletId ? `/outlet/${outletId}/scan` : "#"}
                className={`w-56 text-center shadow drop-shadow-xl shadow-gray-500 bg-red-700 text-sm font-medium text-white px-6 py-3 rounded-xl ${
                  outletId
                    ? "hover:bg-red-600"
                    : "cursor-not-allowed opacity-50"
                }`}
              >
                {outletId ? `Go to Shop (${outletId})` : "No outlet available"}
              </Link>
            </>
          )}
          {(user?.role === "ADMIN" || user?.role === "MANAGER") && (
            <>
              {/* <label
                htmlFor="outletId"
                className="text-md text-gray-800 font-sans font-medium"
              >
              </label> */}
              <Link
                href="/office/products"
                className="w-56 text-center shadow drop-shadow-lg shadow-gray-600 bg-red-700 text-sm hover:bg-red-600 font-medium text-white px-6 py-3 rounded-xl"
              >
                Go to Office Dashboard
              </Link>
            </>
          )}
        </div>
        <button
          onClick={() => {
            logout();
            router.push("/auth/login");
          }}
          className="text-center text-sm font-bold w-56 mt-4 left-4 text-red-800  px-6 py-3 rounded-xl hover:bg-red-100"
        >
          Logout
        </button>
      </div>
    </AuthGuard>
  );
}
