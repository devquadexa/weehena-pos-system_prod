export interface Product {
  barcode: string;
  name: string;
  packPrice: number;
  pricePerKg: number;
  weighted: boolean;
}

export interface CartItem extends Product {
  value: number;
}
