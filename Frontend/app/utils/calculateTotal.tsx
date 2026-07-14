// import { CartItem } from "../types";

import { CartItem } from "../types/Product";

export const calculateTotal = (
  cart: CartItem[],
  discount: number,
  discountType: "percentage" | "fixed",
  bulkThreshold: number = 10, // qty at/above which bulkPrice applies (non-weighted items only)
) => {
  const subtotal = cart.reduce((sum, item) => {
    const isBulk = !item.weighted && item.value >= bulkThreshold; // bulk pricing only applies to non-weighted items
    const unitPrice = isBulk ? item.bulkPrice : item.retailPrice;
    return sum + unitPrice * item.value;
  }, 0);

  let total = subtotal;
  let discountAmount = 0;

  if (discountType === "percentage") {
    discountAmount = parseFloat(((subtotal * discount) / 100).toFixed(2));
    total = parseFloat((subtotal - discountAmount).toFixed(2));
  } else {
    total = parseFloat((subtotal - discount).toFixed(2));
    discountAmount = parseFloat(discount.toFixed(2));
  }

  if (total < 0) total = 0;

  return { subtotal, total, discountAmount };
};
