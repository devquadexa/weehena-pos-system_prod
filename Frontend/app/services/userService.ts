import { jwtDecode } from "jwt-decode";

export interface JwtPayload {
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
    // return jwtDecode<JwtPayload>(token);
    return {
      username: decoded.sub || decoded.username,
      role: decoded.role || decoded.roles?.[0],
    };
  } catch (err) {
    console.error("Invalid token", err);
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
};
