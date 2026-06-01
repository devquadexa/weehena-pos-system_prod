"use client";
import { ReactNode } from "react";

interface Props {
  onClick: () => void;
  children: ReactNode;
  className?: string;
}

export default function Button({ onClick, children, className }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-5 py-2 text-white rounded transition ${className}`}
    >
      {children}
    </button>
  );
}
