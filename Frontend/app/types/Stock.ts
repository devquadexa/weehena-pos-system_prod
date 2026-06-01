
export interface StockItem {
  id: number;
  productName: string;
  barcode: number;
  quantity: number;
  outletId: string;
  lowStockThresholdQty: number;
  lowStockThresholdWeight: number;
  weight: number;
  weighted: boolean;
}

export interface StockHistoryItem {
  id: number;
  barcode: string;
  productName: string;
  outletId: string;
  oldStock: number;
  updatedStock: number;
  newStock: number;
  changedBy: string;
  changedAt: string;
}

export interface StockRequest {
  barcode: number | "";
  lowStockThresholdQty: number | "";
  lowStockThresholdWeight: number | "";
  outletId: string;
  quantity: number | "";
  weight: number | "";
  user:string
}

export interface StockUpdateRequest {
  value: number;
  user: string;
}