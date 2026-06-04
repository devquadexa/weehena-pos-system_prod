"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getUser } from "@/app/services/authService";
import { jwtDecode } from "jwt-decode";
import { JwtPayload } from "@/app/services/userService";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [time, setTime] = useState("");
  const router = useRouter();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { timeStyle: "medium" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async () => {
    try {
      await getUser(username, password);

      const token = localStorage.getItem("token");
      if (!token) return;

      const decoded = jwtDecode<JwtPayload>(token);

      if (decoded.role === "ADMIN" || decoded.role === "MANAGER") {
        router.push("/");
      } else if (decoded.role === "STAFF" || decoded.role === "CASHIER") {
        router.push("/"); 
      } else {
        alert("Unauthorized role");
      }
    } catch (err) {
      alert("Invalid login credentials");
      console.error("Login error:", err);
    }
  };

  return (
    <div className="flex flex-col h-screen items-center justify-center bg-red-800">
      <div className="text-center text-white mb-8">
        <Image
          src="/weehenaLogo.png"
          alt="Weehena Farm Shop Logo"
          width={120}
          height={120}
          className="mx-auto mb-2 mt-5 size-22 bg-white rounded-full"
        />
        <h1 className="text-2xl text-center font-semibold">
          Weehena Farm Shop
        </h1>
        <p className="text-md font-sans font-normal">
          {new Date().toLocaleDateString("en-US", { dateStyle: "full" })}
        </p>
        <p className="text-md font-sans font-normal">{time}</p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-2xl w-80">
        <form
          action={handleLogin}
          className="flex flex-col px-4 my-4 gap-3  text-xs"
        >
          <label
            htmlFor="username"
            className="font-medium text-sm text-gray-800"
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            placeholder="Enter username"
            className="border-0 bg-gray-200 rounded  text-sm text-gray-800 w-full mb-2 p-2"
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="true"
          />

          <label
            htmlFor="password"
            className="font-medium text-sm text-gray-800"
          >
            Password
          </label>
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder="Enter password"
              className="border-0 bg-gray-200 rounded text-sm text-gray-800 w-full p-2 pr-10"
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-800"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-5"
                  aria-hidden
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-5"
                  aria-hidden
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          <div className="mx-auto text-sm w-full flex flex-col gap-1">
            <button
              type="submit"
              className="mx-auto bg-red-700 hover:bg-red-600 rounded-lg font-semibold text-white w-48 py-2"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
