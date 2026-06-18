export interface Product {
  barcode: string;
  name: string;
  bulkPrice: number;
  retailPrice: number;
  packPrice: number;
  pricePerKg: number;
  weighted: boolean;
}

export interface CartItem extends Product {
  value: number;
}

export interface ProductItems {
  id: number;
  name: string;
  barcode: number;
  bulkPrice: number;
  retailPrice: number;
  packPrice: number;
  pricePerKg: number;
  weighted: boolean;
}

export interface ProductRequest {
  name: string;
  barcode: number | "";
  bulkPrice: number | "";
  retailPrice: number | "";
  packPrice: number | "";
  pricePerKg: number | "";
  weighted: boolean | "";
}
export interface UpdatePriceRequest {
  barcode: number;
  bulkPrice: number;
  retailPrice: number;
  packPrice: number;
  pricePerKg: number;
}
