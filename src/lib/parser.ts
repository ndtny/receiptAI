import { ExtractedFields } from "@/types";

const AMOUNT_RE = /(?:\$|€|£|¥|USD|EUR|GBP|JPY|CAD|AUD)\s*[\d,]+\.?\d*/gi;
const AMOUNT_NUM_RE = /[\d,]+\.\d{2}/g;
const DATE_RE =
  /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{1,2},?\s*\d{2,4}/gi;
const TOTAL_KEYWORDS =
  /(?:total|amount\s*due|grand\s*total|balance\s*due|sum|net\s*amount)/i;
const TAX_KEYWORDS = /(?:tax|vat|gst|hst|sales\s*tax)/i;

function findCurrency(text: string): string {
  const symbols: Record<string, string> = {
    $: "USD",
    "€": "EUR",
    "£": "GBP",
    "¥": "JPY",
  };
  for (const [sym, code] of Object.entries(symbols)) {
    if (text.includes(sym)) return code;
  }
  const codes = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF"];
  for (const code of codes) {
    if (text.toUpperCase().includes(code)) return code;
  }
  return "USD";
}

function findTotal(text: string): string {
  const lines = text.split("\n");
  for (const line of lines) {
    if (TOTAL_KEYWORDS.test(line)) {
      const amounts = line.match(AMOUNT_NUM_RE);
      if (amounts) return amounts[amounts.length - 1];
    }
  }
  // Fallback: largest amount
  const allAmounts = text.match(AMOUNT_NUM_RE) || [];
  if (allAmounts.length > 0) {
    return allAmounts.reduce((max, a) =>
      parseFloat(a.replace(/,/g, "")) > parseFloat(max.replace(/,/g, ""))
        ? a
        : max
    );
  }
  return "";
}

function findTax(text: string): string {
  const lines = text.split("\n");
  for (const line of lines) {
    if (TAX_KEYWORDS.test(line)) {
      const amounts = line.match(AMOUNT_NUM_RE);
      if (amounts) return amounts[amounts.length - 1];
    }
  }
  return "";
}

function findDate(text: string): string {
  const matches = text.match(DATE_RE);
  return matches ? matches[0] : "";
}

function findVendor(text: string): string {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 2);
  // First non-numeric, non-date line is likely the vendor
  for (const line of lines.slice(0, 5)) {
    if (!AMOUNT_NUM_RE.test(line) && !DATE_RE.test(line) && line.length < 60) {
      return line;
    }
  }
  return lines[0] || "";
}

export function parseReceipt(text: string): ExtractedFields {
  return {
    vendor: findVendor(text),
    date: findDate(text),
    total: findTotal(text),
    tax: findTax(text),
    currency: findCurrency(text),
    category: "",
    notes: "",
  };
}
