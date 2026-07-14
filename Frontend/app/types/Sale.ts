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
  productName: string;
  invoiceNo: string;
  saleStatus: string;
  saleDate: string;
  saleQty: number;
  salePrice: number;
  saleValue: number;
}

export interface CancelledSaleItem {
  invoiceNo: string;
  date: string;
  barcode: string;
  itemName: string;
  saleQty: number;
  salePrice: number;
  saleValue: number;
}
