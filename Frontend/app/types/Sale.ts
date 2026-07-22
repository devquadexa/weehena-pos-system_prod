export interface SaleData {
  invoiceNo: string;
  outletId: string;
  discountValue: number;
  items: {
    barcode: string;
    value: number;
  }[];
}

export interface ProductSaleData {
  invoiceNo: string;
  productName: string;
  saleStatus: string;
  saleDate: string;
  saleQty: number;
  salePrice: number;
  saleValue: number;
}

export interface CancelledSaleItem {
  invoiceNo: string;
  itemName: string;
  barcode: string;
  saleQty: number;
  salePrice: number;
  saleValue: number;
  weighted: boolean;
  date: string;
}
