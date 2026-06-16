"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { CartItem } from "../types";

interface Props {
  cart: CartItem[];
  subtotal: number;
  discount: number;
  discountType: "percentage" | "fixed";
  discountAmount: number;
  total: number;
  invoiceNo: string;
  cashReceived: number;
  balance: number;
}

export default function Receipt({
  cart,
  subtotal,
  discountAmount,
  total,
  invoiceNo,
  cashReceived,
  balance,
}: Props) {
  const [isClient, setIsClient] = useState(false);

  // hydration fix: only render on client side
  const updateIsClient = useEffectEvent((isClient: boolean) => {
    setIsClient(isClient);
  });

  useEffect(() => {
    updateIsClient(true);
  }, []);

  const date = new Date().toLocaleString();

  return (
    isClient && (
      <div
        id="receipt-print"
        className="receipt bg-white w-75.5 max-w-sm text-black text-[12px]  p-4 border shadow"
      >
        {/* Header */}
        <div className="text-center">
          <h1 className="font-bold text-sm">Weehena Farm Shop</h1>
          <p>Katunayake, Sri Lanka</p>
          <p>Tel: 077-1234567</p>
        </div>

        <div className="border-t border-dashed my-2" />

        {/* Invoice Info */}
        <div className="flex flex-col">
          <p>Invoice: {invoiceNo}</p>
          <p>Date: {date}</p>
        </div>

        <div className="border-t border-dashed my-2" />

        {/* Items */}
        <div className="">
          <div className="flex justify-between gap-2 font-semibold">
            <span className="w-12 text-left">Qty</span>
            <span className="w-48 ">Item</span>
            <span className="w-16 text-right">Price</span>
            <span className="w-16 text-right">Total</span>
          </div>
          {cart.map((item, i) => (
            <div
              key={i}
              className="flex gap-2 text-right text-[10px] justify-between mt-2 mb-2"
            >
              <span className="w-12 text-[10px] text-left">
                {item.weighted ? `${item.value}Kg` : `${item.value} `}
              </span>
              <span className="w-48 text-left">{item.name}</span>
              <span className="w-16">
                {" "}
                {item.weighted ? item.pricePerKg : item.packPrice}
              </span>
              <span className="w-16">
                {item.weighted
                  ? (item.pricePerKg * item.value).toFixed(2)
                  : (item.packPrice * item.value).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-dashed my-2" />

        {/* Total */}
        <div className="grid font-semibold grid-cols-2 justify-between">
          <span className="text-left">SUBTOTAL Rs.</span>
          <span className="text-right"> {subtotal.toFixed(2)}</span>
          <span className="text-left">DISCOUNT Rs.</span>
          <span className="text-right"> {discountAmount.toFixed(2)}</span>
          <span className="text-left">TOTAL Rs.</span>
          <span className="text-right"> {total.toFixed(2)}</span>
          <span className="text-left">CASH RECEIVED Rs.</span>
          <span className="text-right"> {cashReceived.toFixed(2)}</span>
          <span className="text-left">CHANGE Rs.</span>
          <span className="text-right"> {balance.toFixed(2)}</span>
        </div>
      </div>
    )
  );
}
