"use client";

import { useState, useContext, useRef, useCallback } from "react";
import { CartContext } from "@/app/context/CartContext";
import BarcodeInput from "@/app/components/BarcodeInput";
import CartTable from "@/app/components/CartTable";
import TotalDisplay from "@/app/components/TotalDisplay";
import Button from "@/app/components/Button";
import {
  fetchProduct,
  fetchProductsByName,
} from "@/app/services/productService";
import QuantityModal from "@/app/components/QuantityModal";
import Receipt from "@/app/components/Receipt";
import DiscountModal from "@/app/components/DiscountModal";
import { calculateTotal } from "@/app/utils/calculateTotal";
import generateInvoiceNumber from "@/app/utils/generateInvoiceNumber";
import { cancelLastSale, processSale } from "@/app/services/saleService";
import { useParams } from "next/navigation";
import WeightModal from "@/app/components/WeightModal";
import { printReceipt } from "@/app/services/receiptPrinter";
import PaymentModal from "@/app/components/PaymentModal";
import toast from "react-hot-toast";
import { DollarSign, Percent, ShoppingCart, X } from "lucide-react";
import ProductSearchInput from "@/app/components/ProductSearchInput";
import { Product } from "@/app/types/Product";

export default function ScanPage() {
  const [barcode, setBarcode] = useState<string>("");

  // Name search state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);

  const { cart, setCart } = useContext(CartContext)!;

  // Quantity Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  //Discount Modal State
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  // const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">(
    "percentage",
  );
  const [discountValue, setDiscountValue] = useState(0);

  //PaymentModal
  const [cashReceived, setCashReceived] = useState(0);
  const [balance, setBalance] = useState(0);

  // Weight Modal State
  const [weightModalOpen, setWeightModalOpen] = useState(false);

  // Invoice State
  const [invoiceNo, setInvoiceNo] = useState<string>("");

  // Calculate totals whenever cart or discount changes
  const { subtotal, total, discountAmount } = calculateTotal(
    cart,
    discountValue,
    discountType,
  );

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const params = useParams();
  const outletId = params.id as string;

  const date = new Date().toLocaleString();

  // Shared logic: given a product, open the right modal (qty or weight)
  const processScannedProduct = (product: Product) => {
    setSelectedProduct(product);
    if (product.weighted) {
      setWeightModalOpen(true); // open weight modal for weighted items
    } else {
      setModalOpen(true); // open quantity modal for non-weighted items
    }
  };

  const handleAdd = async () => {
    if (!barcode.trim()) return;
    let product: Product;
    try {
      product = await fetchProduct(barcode);
    } catch {
      toast.error("Product not found");
      return;
    }

    processScannedProduct(product);
    setBarcode("");
  };

  // Search products by name (called as user types, e.g. with a debounce in the input component)
  const handleSearchByName = useCallback(async (name: string) => {
    setSearchTerm(name);
    if (!name.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const results = await fetchProductsByName(name);
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  // When user picks a product from the search results dropdown
  const handleSelectSearchResult = (product: Product) => {
    processScannedProduct(product);
    setSearchTerm("");
    setSearchResults([]);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  // Quantity Hnadler
  const handleConfirmQty = (qty: number) => {
    if (!selectedProduct) return;
    const existing = cart.find(
      (item) => item.barcode === selectedProduct.barcode,
    );
    if (existing) {

      // Add to existing quantity
      setCart(
        cart.map((item) =>
          item.barcode === selectedProduct.barcode
            ? { ...item, value: item.value + qty }
            : item,
        ),
      );
    } else {
      // Add new item with entered qty
      setCart([...cart, { ...selectedProduct, value: qty }]);
    }

    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  // weight handler
  const handleConfirmWeight = (weight: number) => {
    if (!selectedProduct) return;
    const existing = cart.find(
      (item) => item.barcode === selectedProduct.barcode,
    );

    if (existing) {
      setCart(
        cart.map((item) =>
          item.barcode === selectedProduct.barcode
            ? { ...item, value: item.value + weight }
            : item,
        ),
      );
    } else {
      setCart([...cart, { ...selectedProduct, value: weight }]);
    }

    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleDelete = (barcode: string) => {
    setCart(cart.filter((item) => item.barcode !== barcode));
  };

  const handleApplyDiscount = (value: number, type: "percentage" | "fixed") => {
    setDiscountValue(value);
    setDiscountType(type);
  };

  const buildSaleRequest = () => {
    return {
      invoiceNo: generateInvoiceNumber(),
      outletId: outletId,
      discountType: discountType.toUpperCase(),
      discountValue: discountValue,
      items: cart.map((item) => ({
        barcode: item.barcode,
        value: item.value,
      })),
    };
  };

  const handlePaymentConfirm = (cash: number) => {
    setCashReceived(cash);
    setBalance(cash - total);

    handlePay(cash, cash - total);
  };

  const handlePay = async (cashReceived: number, balance: number) => {
    if (cart.length === 0) return;

    try {
      setLoading(true);
      const saleData = buildSaleRequest();
      await processSale(saleData);
      const newInvoice = saleData.invoiceNo;
      setInvoiceNo(newInvoice);
      toast.success(`Payment Done\nInvoice: ${newInvoice}`, {
        duration: 4000,
      });
      await printReceipt(
        {
          cart,
          subtotal,
          discountAmount,
          total,
          invoiceNo: saleData.invoiceNo,
          cashReceived,
          balance,
          outletId,
          date,
        },
        "XP-80C", //shop printer
        // "XP-80C (copy 1)", //test printer
      );
    } catch (error: unknown) {
      console.error(error);
      toast.error("Payment Failed ❌ " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelLastSale = async () => {
    const confirmed = confirm("Are you sure you want to cancel the last sale?");
    if (!confirmed) return;
    try {
      const sale = await cancelLastSale();
      toast.success(`Sale ${sale.invoiceNo} cancelled successfully`, {
        duration: 4000,
      });
    } catch (err: unknown) {
      toast.error((err as Error).message, {
        duration: 3000,
      });
    }
  };

  return (
    <div className="not-print p-6 max-w-4xl mx-auto font-poppins">
      <BarcodeInput
        barcode={barcode}
        setBarcode={setBarcode}
        handleAdd={handleAdd}
        inputRef={inputRef}
      />

      <ProductSearchInput
        searchTerm={searchTerm}
        setSearchTerm={handleSearchByName}
        results={searchResults}
        loading={searching}
        onSelect={handleSelectSearchResult}
      />

      <CartTable cart={cart} onDelete={handleDelete} />

      <TotalDisplay
        discountAmount={discountAmount}
        subtotal={subtotal}
        total={total}
        discount={discountValue}
        discountType={discountType}
      />

      <div className="mt-4 ">
        {/* Pay Button */}
        <Button
          onClick={() => {
            if (cart.length === 0 || loading) return;
            setPaymentModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-500 text-white mr-3 rounded disabled:bg-gray-400"
        >
          <DollarSign className="size-5 mx-auto" />
          {loading ? "Processing..." : "Pay"}
        </Button>

        {/* Discount Button */}
        <Button
          onClick={() => setDiscountModalOpen(true)}
          className=" mr-3 mt-4 bg-amber-500 hover:bg-amber-600 rounded text-white"
        >
          <Percent className="size-5 mx-auto" />
          Discount
        </Button>

        {/* Clear Cart Button */}
        <Button
          onClick={() => {
            setCart([]);
            setInvoiceNo("");
            setDiscountValue(0);
          }}
          className="bg-red-800 hover:bg-red-700"
        >
          <ShoppingCart className="size-5 mx-auto" />
          Clear Cart
        </Button>
      </div>
      <div className="flex items-center my-10">
        <QuantityModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setTimeout(() => {
              inputRef.current?.focus();
            }, 0);
          }}
          onConfirm={handleConfirmQty}
          initialQty={1}
          productName={selectedProduct?.name || ""}
          heading="Enter Quantity"
        />
      </div>
      <div className="flex items-center my-10">
        <WeightModal
          isOpen={weightModalOpen}
          onClose={() => {
            setWeightModalOpen(false);
            setTimeout(() => {
              inputRef.current?.focus();
            }, 0);
          }}
          onConfirm={handleConfirmWeight}
          initialWeight={null}
          productName={selectedProduct?.name || ""}
          heading="Enter Weight (Kg)"
        />
      </div>
      <DiscountModal
        isOpen={discountModalOpen}
        onClose={() => setDiscountModalOpen(false)}
        onApply={handleApplyDiscount}
      />
      <div
        id="receipt-print"
        className="flex flex-col items-start receipt-print"
      >
        <PaymentModal
          isOpen={paymentModalOpen}
          total={total}
          onClose={() => setPaymentModalOpen(false)}
          onConfirm={handlePaymentConfirm}
        />
        <Receipt
          cart={cart}
          invoiceNo={invoiceNo}
          subtotal={subtotal}
          discount={discountValue}
          discountType={discountType}
          discountAmount={discountAmount}
          total={total}
          cashReceived={cashReceived}
          balance={balance}
          outlet={outletId}
          date={date}
        />
        <button
          onClick={handleCancelLastSale}
          className="flex gap-2 items-center hover:bg-red-700 bg-red-800 text-normal mt-5 text-white px-4 py-2 rounded"
        >
          <X className="size-5" />
          Cancel Last Sale
        </button>
      </div>
    </div>
  );
}
