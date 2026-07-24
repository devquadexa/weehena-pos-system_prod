import qz, { CreatePrinterInput, PrintData } from "qz-tray";
import { ReceiptData } from "../types/Receipt";
import { getUserFromToken } from "./userService";

/** 80mm thermal printers are usually ~384 dots wide at 203 DPI. */
export const DEFAULT_LOGO_URL = "/weehena300px.png";

export type LogoSize = {
  width: number;
  /** Omit to keep aspect ratio from the source image. */
  height?: number;
};

export const DEFAULT_LOGO_SIZE: LogoSize = {
  width: 50,
  height: 80,
};

/** Blank lines between logo and header text (0 = tight). */
export const DEFAULT_LOGO_MARGIN_LINES = 1;

/** Fine-tune gap in dots after the logo (0–255). Added after margin lines. */
export const DEFAULT_LOGO_MARGIN_DOTS = 0;

function feedLines(count: number): string {
  return "\n".repeat(Math.max(0, count));
}

/** ESC/POS print-and-feed: advances paper by `dots` without a full line. */
function feedDots(dots: number): string {
  const clamped = Math.min(255, Math.max(0, Math.round(dots)));
  return "\x1B\x4A" + String.fromCharCode(clamped);
}

function logoToHeaderGap(marginLines: number, marginDots: number): string {
  const dots = marginDots > 0 ? feedDots(marginDots) : "";
  return feedLines(marginLines) + dots;
}

async function loadImageDataUrl(
  url: string,
  size: LogoSize = DEFAULT_LOGO_SIZE,
): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Logo not found at ${url}`);
  }

  const blob = await res.blob();
  const bitmap = await createImageBitmap(blob);

  const targetWidth = size.width;
  const targetHeight =
    size.height ?? Math.round((bitmap.height / bitmap.width) * targetWidth);

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Could not create canvas for logo resize");
  }

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, targetWidth, targetHeight);
  ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
  bitmap.close();

  return canvas.toDataURL("image/png");
}

function normalizePrinterName(rawPrinterName: string | CreatePrinterInput) {
  if (Array.isArray(rawPrinterName)) {
    return rawPrinterName[0];
  }
  return rawPrinterName;
}

// Wrap long item names
function wrapText(text: string, width: number) {
  const lines: string[] = [];

  for (let i = 0; i < text.length; i += width) {
    lines.push(text.substring(i, i + width));
  }

  return lines;
}

async function getLogoPrintData(
  url: string = DEFAULT_LOGO_URL,
  size: LogoSize = DEFAULT_LOGO_SIZE,
): Promise<PrintData> {
  const dataUrl = await loadImageDataUrl(url, size);

  return {
    type: "raw",
    format: "image",
    flavor: "base64",
    data: dataUrl,
    options: {
      language: "ESCPOS",
      dotDensity: "single",
    },
  };
}

function rawCommand(data: string): PrintData {
  return {
    type: "raw",
    format: "command",
    flavor: "plain",
    data,
    options: {
      language: "ESCPOS",
    },
  };
}

export type LogoPrintOptions = {
  url?: string;
  size?: LogoSize;
  /** Blank lines after logo (default: DEFAULT_LOGO_MARGIN_LINES). */
  marginLines?: number;
  /** Extra dot feed after margin lines (default: DEFAULT_LOGO_MARGIN_DOTS). */
  marginDots?: number;
};

export async function printReceipt(
  data: ReceiptData,
  rawPrinterName: string | CreatePrinterInput,
  logoOptions?: LogoPrintOptions,
) {
  const user = getUserFromToken();
  try {
    // connect to QZ
    if (!qz.websocket.isActive()) {
      await qz.websocket.connect();
    }

    const printerName = normalizePrinterName(rawPrinterName);

    if (!printerName) {
      throw new Error("Printer name is required");
    }

    let printer = await qz.printers.find(printerName);

    if (Array.isArray(printer)) {
      printer = printer[0];
    }

    const config = qz.configs.create(printer);

    const ESC = "\x1B";
    const CENTER = ESC + "a" + "\x01";
    const LEFT = ESC + "a" + "\x00";
    const BOLD_ON = ESC + "E" + "\x01";
    const BOLD_OFF = ESC + "E" + "\x00";
    // GS V 0 = full cut. Do NOT use \x41 — that byte is ASCII "A" and many
    // printers print it when the cut mode is unsupported.
    const CUT = "\x1D\x56\x00";
    const GS = "\x1D";

    // ESC p m t1 t2 — kicks the cash drawer wired into the printer's pin-2
    // (RJ11) port. m=0x00 selects pin 2 (per DBL terminal wiring), t1/t2
    // are the on/off pulse widths (~25ms units). 0x19/0xFA is a safe
    // default pulse for most drawers.
    const OPEN_DRAWER = "\x1B\x70\x00\x19\xFA"; // ← NEW

    let receipt = "";

    // Header (gap after logo is controlled by logoToHeaderGap, not extra \n here)
    receipt += CENTER;
    receipt += BOLD_ON;

    receipt += GS + "!" + "\x10";
    receipt += "WEEHENA FARM SHOP\n";

    receipt += GS + "!" + "\x00";
    receipt += BOLD_OFF;

    receipt += `${data.outletId}\n`;
    receipt += "Tel: 071-5467675\n\n";

    // Invoice
    receipt += "------------------------------------------------\n";
    receipt += LEFT;

    receipt += `Invoice : ${data.invoiceNo}\n`;
    receipt += `Date    : ${data.date}\n`;
    receipt += `Cashier : ${user?.username}\n`;

    receipt += "------------------------------------------------\n";

    receipt += "ITEM                     QTY     PRICE   TOTAL\n";
    receipt += "------------------------------------------------\n\n";

    // Items
    data.cart.forEach((item) => {
      const bulkThreshold = 10;
      const qty = item.weighted
        ? `${item.value.toFixed(3)}Kg`
        : `${item.value}`;

      // Bulk pricing only applies to non-weighted (pack) items
      const isBulk = !item.weighted && item.value >= bulkThreshold;
      const unitPrice = isBulk ? item.bulkPrice : item.retailPrice;

      const price = unitPrice.toFixed(2);

      const lineTotal = unitPrice * item.value;

      const ITEM_WIDTH = 22;

      // Split long item names
      const itemLines = wrapText(
        isBulk ? `${item.name} (bulk)` : item.name,
        ITEM_WIDTH,
      );

      itemLines.forEach((line, index) => {
        const itemCol = line.padEnd(ITEM_WIDTH);

        // show values only on first line
        const qtyCol = index === 0 ? qty.padStart(7) : "".padStart(7);

        const priceCol = index === 0 ? price.padStart(9) : "".padStart(9);

        const totalCol =
          index === 0 ? lineTotal.toFixed(2).padStart(9) : "".padStart(9);

        receipt += `${itemCol}${qtyCol}${priceCol}${totalCol}\n`;
      });

      receipt += "\n";
    });

    receipt += "------------------------------------------------\n";

    // Totals
    receipt += GS + "!" + "\x10";

    receipt +=
      "SUBTOTAL".padEnd(13) + data.subtotal.toFixed(2).padStart(10) + "\n";

    receipt +=
      "DISCOUNT".padEnd(13) +
      data.discountAmount.toFixed(2).padStart(10) +
      "\n";

    receipt += "TOTAL".padEnd(13) + data.total.toFixed(2).padStart(10) + "\n\n";

    receipt +=
      "CASH".padEnd(13) + data.cashReceived.toFixed(2).padStart(10) + "\n";

    receipt +=
      "CHANGE".padEnd(13) + data.balance.toFixed(2).padStart(10) + "\n";

    receipt += GS + "!" + "\x00";

    receipt += "------------------------------------------------\n\n";

    // Footer
    receipt += CENTER;

    receipt += GS + "!" + "\x00";
    receipt += "Thank You! Come Again\n\n";
    receipt += "www.weehena.lk | 0322254209\n\n\n\n\n\n\n\n";

    // Open cash drawer BEFORE the cut — some printers stop accepting
    // commands (or clip the pulse) once the cut command has been sent.
    receipt += OPEN_DRAWER; // ← NEW

    // Cut
    receipt += CUT;

    const logo = await getLogoPrintData(logoOptions?.url, logoOptions?.size);

    const marginLines = logoOptions?.marginLines ?? DEFAULT_LOGO_MARGIN_LINES;
    const marginDots = logoOptions?.marginDots ?? DEFAULT_LOGO_MARGIN_DOTS;
    const afterLogo = logoToHeaderGap(marginLines, marginDots);

    const printData: PrintData[] = [
      // logo,
      // rawCommand("\x1B\x40" + afterLogo + receipt),
      rawCommand("\x1B\x40\x1B\x61\x01"), // Initialize + Center
      logo,
      rawCommand(afterLogo + receipt),
    ];
    await qz.print(config, printData);

    console.log("Printed successfully");
  } catch (error) {
    console.error(error);
  }
}
