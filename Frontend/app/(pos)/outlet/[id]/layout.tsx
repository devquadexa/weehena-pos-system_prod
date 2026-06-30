'use client";';

import { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import PosGuard from "@/app/components/PosGuard";
import { House } from "lucide-react";
import UserBadge from "@/app/components/UserBadge";

interface Props {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

export default async function ScanLayout({ children, params }: Props) {
  const { id } = await params;
  return (
    <PosGuard>
      <div className="min-h-screen w-full">
        {/* Optional Header */}
        <div className="flex gap-2 bg-red-700 text-xl text-white p-4 font-semibold">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/weehenaLogo.png"
              alt="Weehena Farm Shop Logo"
              width={50}
              height={50}
              className="inline-block mr-3 size-10 bg-white rounded-full"
            />
          </Link>
          <p className="my-auto"> Weehena Farm Shop - {id}</p>
          <UserBadge className="mx-auto"/> 
          <Link
            href="/"
            className="flex items-center gap-2 ml-auto hover:bg-red-700 font-normal text-base text-white px-4 py-2 rounded"
          >
            <House className="size-5"/>
            Back to Home
          </Link>
        </div>
        {/* Page Content */}
        <div className="p-4 min-h-screen bg-white">{children}</div>
      </div>
    </PosGuard>
  );
}
