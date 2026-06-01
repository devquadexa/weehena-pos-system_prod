"use client";

import { useEffect, useEffectEvent, useState } from "react";

interface Props {
  subtotal: number;
  total: number;
  discount: number;
  discountType: "percentage" | "fixed";
  discountAmount: number;
}

export default function TotalDisplay({
  subtotal,
  total,
  discount,
  discountType,
  discountAmount,
}: Props) {
  const [isClient, setIsClient] = useState(false);

  const updateIsClient = useEffectEvent((isClient: boolean) => {
    setIsClient(isClient);
  });

  useEffect(() => {
    updateIsClient(true);
  }, []);

  return (
    isClient && (
      <div className="mt-4 text-red-900 font-semibold">
        <h2>Subtotal : Rs. {subtotal.toFixed(2)}</h2>
        {discountType === "percentage" ? (
          <h2>
            Discount : {discount} %
          </h2>
        ) : (
          <h2 hidden={true}>
            Discount (Rs.): {discount} 
          </h2>
        )}
        <h2>Discount Amount : Rs. {discountAmount.toFixed(2)}</h2>
        <h2 className="text-2xl font-bold">Total: Rs. {total.toFixed(2)}</h2>
      </div>
    )
  );
}
