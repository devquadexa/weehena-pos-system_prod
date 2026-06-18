export interface UserRequest {
  username: string;
  password: string;
  role: "ADMIN" | "MANAGER" | "CASHIER";
}

export interface UserData {
  id: number,
  username: string;
  role: "ADMIN" | "MANAGER" | "CASHIER";
}
