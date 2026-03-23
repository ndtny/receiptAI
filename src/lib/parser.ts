import { ExtractedFields } from "@/types";

const AMOUNT_NUM_RE = /[\d,]+\.\d{2}/g;

// Date patterns: various common formats including Chinese dates
const DATE_PATTERNS: RegExp[] = [
  // Chinese: 2024年3月15日 or 2024年03月15日
  /\d{4}\s*年\s*\d{1,2}\s*月\s*\d{1,2}\s*日/g,
  // ISO: 2024-03-15, 2024/03/15, 2024.03.15
  /\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}/g,
  // US/EU: 03/15/2024, 15-03-2024, 03.15.2024
  /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/g,
  // English month: March 15, 2024 or Mar 15 2024
  /(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s*\d{2,4}/gi,
  // Day-month: 15 March 2024 or 15 Mar 2024
  /\d{1,2}\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*,?\s*\d{2,4}/gi,
];

const TOTAL_KEYWORDS =
  /(?:total|amount\s*due|grand\s*total|balance\s*due|sum|net\s*amount|合\s*计|总\s*计|总\s*额|应\s*付|实\s*付|实\s*收)/i;
const TAX_KEYWORDS =
  /(?:tax|vat|gst|hst|sales\s*tax|税\s*额|税\s*金|增值税|消费税)/i;

// Currency symbols and codes mapping
const CURRENCY_SYMBOLS: [string | RegExp, string][] = [
  ["€", "EUR"],
  ["£", "GBP"],
  ["₩", "KRW"],
  ["₹", "INR"],
  ["₽", "RUB"],
  ["₫", "VND"],
  ["฿", "THB"],
  ["R$", "BRL"],
];

const CURRENCY_TEXT_PATTERNS: [RegExp, string][] = [
  [/\bRMB\b/i, "CNY"],
  [/\bCNY\b/i, "CNY"],
  [/人民币/, "CNY"],
  [/\bUSD\b/i, "USD"],
  [/\bEUR\b/i, "EUR"],
  [/\bGBP\b/i, "GBP"],
  [/\bJPY\b/i, "JPY"],
  [/\bCAD\b/i, "CAD"],
  [/\bAUD\b/i, "AUD"],
  [/\bCHF\b/i, "CHF"],
  [/\bHKD\b/i, "HKD"],
  [/\bTWD\b/i, "TWD"],
  [/\bKRW\b/i, "KRW"],
  [/\bSGD\b/i, "SGD"],
  [/\bMYR\b/i, "MYR"],
];

// Category inference keywords
const CATEGORY_RULES: [RegExp, string][] = [
  [/(?:restaurant|cafe|coffee|starbucks|mcdonald|burger|pizza|sushi|食堂|餐厅|饭店|咖啡|奶茶|美团|饿了么|外卖|麦当劳|肯德基|KFC|subway)/i, "Food & Dining"],
  [/(?:supermarket|grocery|walmart|costco|target|aldi|超市|便利店|7-eleven|全家|罗森|永辉|盒马|大润发|沃尔玛)/i, "Groceries"],
  [/(?:gas\s*station|fuel|petrol|shell|exxon|加油|中石油|中石化|加油站)/i, "Transportation"],
  [/(?:uber|lyft|taxi|cab|bus|metro|subway|train|airline|flight|航空|火车|高铁|地铁|公交|出租|滴滴|打车)/i, "Transportation"],
  [/(?:hotel|motel|airbnb|inn|resort|hostel|酒店|宾馆|民宿|住宿)/i, "Travel & Lodging"],
  [/(?:pharmacy|drug\s*store|hospital|clinic|doctor|medical|药店|医院|诊所|药房)/i, "Healthcare"],
  [/(?:amazon|ebay|taobao|jd\.com|淘宝|京东|天猫|拼多多|网购)/i, "Online Shopping"],
  [/(?:cinema|movie|theater|netflix|spotify|游戏|电影|影院|娱乐)/i, "Entertainment"],
  [/(?:office|staples|print|copy|办公|文具|打印)/i, "Office Supplies"],
  [/(?:electric|water|gas|internet|phone|电费|水费|燃气|网费|话费|通信)/i, "Utilities"],
];

function findCurrency(text: string): string {
  // Check ¥ symbol — need context to distinguish CNY vs JPY
  if (text.includes("¥") || text.includes("￥")) {
    // If Chinese text detected, treat ¥ as CNY
    if (/[\u4e00-\u9fff]/.test(text) || /RMB|CNY|人民币/i.test(text)) {
      return "CNY";
    }
    return "JPY";
  }
  // Check $ — need context for different dollar currencies
  if (text.includes("$")) {
    if (/R\$/.test(text)) return "BRL";
    if (/\bCAD\b/i.test(text) || /canada/i.test(text)) return "CAD";
    if (/\bAUD\b/i.test(text) || /australia/i.test(text)) return "AUD";
    if (/\bHKD\b|港币/i.test(text)) return "HKD";
    if (/\bTWD\b|新台[币幣]/i.test(text)) return "TWD";
    if (/\bSGD\b/i.test(text) || /singapore/i.test(text)) return "SGD";
    return "USD";
  }
  // Check other symbols
  for (const [sym, code] of CURRENCY_SYMBOLS) {
    if (typeof sym === "string" ? text.includes(sym) : sym.test(text)) return code;
  }
  // Check text-based patterns
  for (const [re, code] of CURRENCY_TEXT_PATTERNS) {
    if (re.test(text)) return code;
  }
  // Chinese text without explicit currency marker → CNY
  if (/[\u4e00-\u9fff]/.test(text)) return "CNY";
  return "USD";
}

function findAmount(text: string): string[] {
  // Match amounts with decimals (e.g. 12.50, 1,234.56)
  const decimals = text.match(AMOUNT_NUM_RE) || [];
  // Also match integer amounts common in some currencies (e.g. ¥1500, 1,500)
  const integers = text.match(/(?<=[\$€£¥￥₩₹])\s*[\d,]+(?!\.\d)/g) || [];
  return [...decimals, ...integers.map((s) => s.trim())];
}

function findTotal(text: string): string {
  const lines = text.split("\n");
  for (const line of lines) {
    if (TOTAL_KEYWORDS.test(line)) {
      const amounts = findAmount(line);
      if (amounts.length > 0) return amounts[amounts.length - 1];
    }
  }
  // Fallback: largest decimal amount
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
  // First pass: look for tax keyword + amount on same line
  for (const line of lines) {
    if (TAX_KEYWORDS.test(line)) {
      const amounts = findAmount(line);
      if (amounts.length > 0) return amounts[amounts.length - 1];
    }
  }
  // Second pass: if tax keyword found, check next line for amount
  for (let i = 0; i < lines.length; i++) {
    if (TAX_KEYWORDS.test(lines[i]) && i + 1 < lines.length) {
      const amounts = findAmount(lines[i + 1]);
      if (amounts.length > 0) return amounts[0];
    }
  }
  return "";
}

function findDate(text: string): string {
  for (const pattern of DATE_PATTERNS) {
    // Reset lastIndex for global regexes
    pattern.lastIndex = 0;
    const match = pattern.exec(text);
    if (match) return match[0].trim();
  }
  return "";
}

function findVendor(text: string): string {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 2);
  const dateCheck = /\d{4}[\/\-\.年]\d{1,2}/;
  const amountCheck = /^\s*[\d,]+\.\d{2}\s*$/;
  for (const line of lines.slice(0, 5)) {
    if (!amountCheck.test(line) && !dateCheck.test(line) && line.length < 60) {
      return line;
    }
  }
  return lines[0] || "";
}

function inferCategory(text: string, vendor: string): string {
  const combined = `${vendor}\n${text}`;
  for (const [pattern, category] of CATEGORY_RULES) {
    if (pattern.test(combined)) return category;
  }
  return "";
}

function buildNotes(text: string, fields: Omit<ExtractedFields, "notes" | "category">): string {
  // Extract item lines: lines that have a price but aren't total/tax/vendor/date
  const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
  const items: string[] = [];
  for (const line of lines) {
    // Skip lines that are the vendor, total, tax, or date
    if (TOTAL_KEYWORDS.test(line)) continue;
    if (TAX_KEYWORDS.test(line)) continue;
    if (line === fields.vendor) continue;
    // Look for lines with an amount — these are likely item lines
    if (AMOUNT_NUM_RE.test(line) && !(/^[\d,]+\.\d{2}$/.test(line.trim()))) {
      // Reset regex lastIndex
      AMOUNT_NUM_RE.lastIndex = 0;
      items.push(line);
    }
    AMOUNT_NUM_RE.lastIndex = 0;
  }
  if (items.length === 0) return "";
  // Return first few items as notes
  return items.slice(0, 5).join("; ");
}

export function parseReceipt(text: string): ExtractedFields {
  const vendor = findVendor(text);
  const date = findDate(text);
  const total = findTotal(text);
  const tax = findTax(text);
  const currency = findCurrency(text);
  const category = inferCategory(text, vendor);
  const notes = buildNotes(text, { vendor, date, total, tax, currency });

  return { vendor, date, total, tax, currency, category, notes };
}
