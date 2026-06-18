import { CartItem } from "../types";

export const calculateTotal = (
  cart: CartItem[],
  discount: number,
  discountType: "percentage" | "fixed",
) => {
  const subtotal = cart.reduce(
    (sum, item) =>
      sum +
      (item.weighted
        ? item.retailPrice * item.value // weight * price per kg
        : item.retailPrice * item.value), //qty * price per pack
    0,
  );

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
