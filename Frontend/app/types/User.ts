export interface UserRequest {
  username: string;
  password: string;
  role: "ADMIN" | "MANAGER" | "CASHIER";
}
