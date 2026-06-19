import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./context/CartContext";
import TokenExpiryWatcher from "./components/TokenExpiryWatcher";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Weehena Farm Shop POS System",
  description: "Chicken and Sausage POS System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <TokenExpiryWatcher />

          {children}
          <Toaster
            toastOptions={{
              success: {
                duration: 5000,
              },
              error: {
                duration: 5000,
              },
            }}
          />
        </CartProvider>
      </body>
    </html>
  );
}
