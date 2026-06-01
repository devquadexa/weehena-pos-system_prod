export interface CartItem {
  name: string;
  value: number;
  weighted: boolean;
  pricePerKg: number;
  packPrice: number;
}

export interface ReceiptData {
  cart: CartItem[];
  subtotal: number;
  discountAmount: number;
  total: number;
  invoiceNo: string;
}