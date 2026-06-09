import { jwtDecode } from "jwt-decode";
import { UserRequest } from "../types/User";

const API_URL = "https://weehenapos360.cloud/api/users";

export interface JwtPayload {
  exp: number;
  sub?: string; // username (Spring default)
  username?: string;
  role?: string;
  roles?: string[];
}

export const getUserFromToken = () => {
  try {
    if (typeof window === "undefined") {
      return null;
    }
    const token = localStorage.getItem("token");
    if (!token) return null;
    const decoded = jwtDecode<JwtPayload>(token);
    return {
      username: decoded.sub || decoded.username,
      role: decoded.role || decoded.roles?.[0],
    };
  } catch (err) {
    console.error("Invalid token", err);
    return null;
  }
};

export const register = async (data: UserRequest) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to register user");
  return await res.text();
};

// check if token is expired
export const isTokenExpired = () => {
  const token = localStorage.getItem("token");

  if (!token) return true;

  try {
    const decoded = jwtDecode<JwtPayload>(token);

    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
};
