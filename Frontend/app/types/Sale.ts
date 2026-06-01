export interface SaleData {
  date: string;
  invoiceNo: string;
  outletId: string;
  discountAmount: number;
  items: {
    barcode: string;
    value: number;
    priceType: string;
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
