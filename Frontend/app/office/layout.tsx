"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import AdminGuard from "../components/AdminGuard";
import { logout } from "../services/userService";
import { Toaster } from "react-hot-toast";
import { LogOut } from "lucide-react";

interface Props {
  children: ReactNode;
}

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
  { name: "Users", path: "/users" },
];

function getActiveParentMenu(pathname: string): string | null {
  const activeParent = navItems.find((item) =>
    item.children?.some((child) => pathname === `/office${child.path}`),
  );
  return activeParent?.name ?? null;
}

export default function OfficeLayout({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [openMenu, setOpenMenu] = useState<string | null>(() =>
    getActiveParentMenu(pathname),
  );
  const [lastPathname, setLastPathname] = useState(pathname);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setSidebarOpen(false);
    const activeParent = getActiveParentMenu(pathname);
    if (activeParent) {
      setOpenMenu(activeParent);
    }
  }

  const toggleMenu = (name: string) => {
    setOpenMenu(openMenu === name ? null : name);
  };

  useEffect(() => {
    if (!sidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sidebarOpen]);

  const closeSidebar = () => setSidebarOpen(false);

  const isReportPage = pathname.startsWith("/office/reports");

  return (
    <AdminGuard>
      <div className="h-dvh text-sm flex flex-col lg:flex-row overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center gap-3 bg-red-800 text-white px-3 py-2.5 shadow-md">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md hover:bg-red-700 transition shrink-0"
            aria-label="Open menu"
            aria-expanded={sidebarOpen}
          >
            <svg
              className="size-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <Image
            src="/weehenaLogo.png"
            alt=""
            width={36}
            height={36}
            className="size-9 bg-white rounded-full shrink-0"
          />
          <h1 className="font-bold text-sm truncate min-w-0">
            Weehena Farm Shop
          </h1>
        </header>

        {/* Backdrop */}
        {sidebarOpen && (
          <button
            type="button"
            className="lg:hidden fixed inset-0 z-40 bg-black/50"
            onClick={closeSidebar}
            aria-label="Close menu"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`w-64 max-w-[85vw] bg-white drop-shadow-gray-400 drop-shadow-xl/50 fixed inset-y-0 left-0 z-50 flex flex-col transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
        >
          <div className="grid bg-red-800 text-white p-2 font-bold text-sm relative shrink-0">
            <button
              type="button"
              onClick={closeSidebar}
              className="lg:hidden absolute top-2 right-2 p-1 rounded-md hover:bg-red-700 transition"
              aria-label="Close menu"
            >
              <svg
                className="size-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <Image
              src="/weehenaLogo.png"
              alt="Weehena Farm Shop Logo"
              width={50}
              height={50}
              className="inline-block mx-auto size-10 bg-white rounded-full"
            />
            <h1 className="text-center text-white p-2 mx-auto text-sm sm:text-base">
              Weehena Farm Shop
            </h1>
          </div>

          <nav className="flex flex-col gap-0 mt-4 flex-1 overflow-y-auto overscroll-contain px-2">
            {navItems.map((item) => {
              const isActive =
                pathname === `/office${item.path}` ||
                item.children?.some(
                  (child) => pathname === `/office${child.path}`,
                );
              const isOpen = openMenu === item.name;
              return (
                <div key={item.name}>
                  <div
                    onClick={() =>
                      item.children ? toggleMenu(item.name) : null
                    }
                    className={`px-4 py-2 rounded-md text-left cursor-pointer transition ${
                      isActive
                        ? "bg-red-100 text-red-600 font-semibold"
                        : "hover:bg-gray-100 text-red-900 font-semibold"
                    }`}
                  >
                    {item.children ? (
                      <span className="flex items-center justify-between gap-2">
                        {item.name}
                        <svg
                          className={`size-4 shrink-0 transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </span>
                    ) : (
                      <Link
                        href={`/office${item.path}`}
                        onClick={closeSidebar}
                        className="block"
                      >
                        {item.name}
                      </Link>
                    )}
                  </div>
                  {item.children && isOpen && (
                    <div className="ml-3 mt-1 mb-1 border-l border-red-100 pl-2">
                      {item.children.map((child) => {
                        const isChildActive =
                          pathname === `/office${child.path}`;
                        return (
                          <Link
                            key={child.name}
                            href={`/office${child.path}`}
                            onClick={closeSidebar}
                            className={`block px-3 py-1.5 rounded-md text-sm font-medium transition ${
                              isChildActive
                                ? "text-red-600 font-semibold bg-red-50"
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

          <div className="shrink-0 p-4 border-t border-gray-100 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                closeSidebar();
                router.push("/");
              }}
              className="w-full text-center bg-red-700 text-white px-4 py-2 rounded-md hover:bg-red-600"
            >
              Back to home
            </button>
            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/auth/login");
              }}
              className="flex items-center justify-center gap-2 w-full text-center text-red-700 font-semibold px-4 py-2 rounded-md hover:bg-red-100"
            >
              Logout
              <LogOut className="size-4" />
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main
          className={`flex-1 w-full min-w-0 min-h-0 bg-red-50 pt-14 lg:pt-0 lg:pl-64 p-3 sm:p-4 md:p-6 flex flex-col ${
            isReportPage ? "overflow-y-auto" : "overflow-hidden"
          }`}
        >
          <div
            className={`bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-2xl min-w-0 ${
              isReportPage ? "" : "flex-1 flex flex-col min-h-0 overflow-hidden"
            }`}
          >
            {children}
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3000,
              }}
            />
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
