import { CartItem } from "./Product";

export interface ReceiptData {
  cart: CartItem[];
  subtotal: number;
  discountAmount: number;
  total: number;
  invoiceNo: string;
  cashReceived: number;
  balance: number;
  outletId: string;
  date:string;
}
