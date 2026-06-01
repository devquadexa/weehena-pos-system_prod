"use client";

import Link from "next/link";
import { ReactNode, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import AdminGuard from "../components/AdminGuard";
import { logout } from "../services/userService";

interface Props {
  children: ReactNode;
}

export default function OfficeLayout({ children }: Props) {
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const toggleMenu = (name: string | null) => {
    setOpenMenu(openMenu === name ? null : name);
  };
  const pathname = usePathname();

  const navItems = [
    { name: "Products", path: "/products" },
    {
      name: "Stock",
      path: "/stock",
      children: [
        { name: "Stock List", path: "/stock/stockList" },
        { name: "Stock Update History", path: "/stock/history" },
      ],
    },
    {
      name: "Reports",
      path: "/reports",
      children: [
        { name: "Daily Sales Report", path: "/reports/salesReport" },
        { name: "Day-End Stock Report", path: "/reports/stockReport" },
      ],
    },
  ];

  return (
    <AdminGuard>
      <div className="min-h-screen text-sm flex">
        {/* Sidebar */}
        <aside className="w-50 bg-white drop-shadow-gray-400  drop-shadow-xl/50 fixed h-screen">
          <div className="grid bg-red-800 text-white p-2 font-bold text-sm ">
            <Image
              src="/weehenaLogo.png"
              alt="Weehena Farm Shop Logo"
              width={50}
              height={50}
              className="inline-block mx-auto size-10 bg-white rounded-full"
            />
            <h1 className="text-center  text-white p-2  mx-auto">
              Weehena Farm Shop
            </h1>
          </div>
          <nav className="flex flex-col gap-0 mt-4">
            {navItems.map((item) => {
              const isActive =
                pathname === `/office${item.path}` ||
                item.children?.some(
                  (child) => pathname === `/office${child.path}`,
                );
              const isOpen = openMenu === item.name;
              return (
                <div key={item.name}>
                  {/* Parent Item */}
                  <div
                    onClick={() =>
                      item.children ? toggleMenu(item.name) : null
                    }
                    className={`px-5 py-2 w-42 ml-4 rounded-md text-smd text-left cursor-pointer transition ${
                      isActive
                        ? "bg-red-100 text-red-600 font-semibold"
                        : "hover:bg-gray-100 text-red-900 font-semibold"
                    }`}
                  >
                    {item.children ? (
                      item.name
                    ) : (
                      <Link href={`/office${item.path}`}>{item.name}</Link>
                    )}
                  </div>
                  {/* Submenu */}
                  {item.children && isOpen && (
                    <div className="ml-6 mt-1 mb-1">
                      {item.children.map((child) => {
                        const isChildActive =
                          pathname === `/office${child.path}`;
                        return (
                          <Link
                            key={child.name}
                            href={`/office${child.path}`}
                            className={`block px-6 py-1 w-40 rounded-md text-sm font-medium transition ${
                              isChildActive
                                ? "text-red-600 font-semibold"
                                : "text-gray-600 hover:text-red-500 hover:bg-gray-100"
                            }`}
                          >
                            {child.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
          <div className="absolute bottom-4 left-4 flex flex-col gap-2 mt-auto mb-4">
            <button
              onClick={() => {
                router.push("/");
              }}
              className="text-center w-42 left-4 bg-red-700 text-white px-4 py-2 rounded-md hover:bg-red-600"
            >
              Back to home
            </button>
            <button
              onClick={() => {
                logout();
                router.push("/auth/login");
              }}
              className="text-center w-42 bottom-4 left-4 text-red-700 font-semibold px-4 py-2 rounded-md hover:bg-red-100"
            >
              Logout
            </button>
          </div>
        </aside>
        {/* Main Content */}
        <main className="flex-1 bg-red-50 ml-50 p-6">
          <div className="bg-white p-6 rounded-lg shadow-2xl">{children}</div>
        </main>
      </div>
    </AdminGuard>
  );
}
