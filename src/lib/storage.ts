import { Receipt, Template } from "@/types";

const RECEIPTS_KEY = "receiptx_receipts";
const TEMPLATES_KEY = "receiptx_templates";

function getItem<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}

function setItem<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Receipts
export function getReceipts(): Receipt[] {
  return getItem<Receipt>(RECEIPTS_KEY).sort(
    (a, b) => b.createdAt - a.createdAt
  );
}

export function getReceipt(id: string): Receipt | undefined {
  return getItem<Receipt>(RECEIPTS_KEY).find((r) => r.id === id);
}

export function saveReceipt(receipt: Receipt): void {
  const receipts = getItem<Receipt>(RECEIPTS_KEY);
  const idx = receipts.findIndex((r) => r.id === receipt.id);
  if (idx >= 0) {
    receipts[idx] = { ...receipt, updatedAt: Date.now() };
  } else {
    receipts.push(receipt);
  }
  setItem(RECEIPTS_KEY, receipts);
}

export function deleteReceipt(id: string): void {
  const receipts = getItem<Receipt>(RECEIPTS_KEY).filter((r) => r.id !== id);
  setItem(RECEIPTS_KEY, receipts);
}

// Templates
export function getTemplates(): Template[] {
  return getItem<Template>(TEMPLATES_KEY).sort(
    (a, b) => b.createdAt - a.createdAt
  );
}

export function saveTemplate(template: Template): void {
  const templates = getItem<Template>(TEMPLATES_KEY);
  const idx = templates.findIndex((t) => t.id === template.id);
  if (idx >= 0) {
    templates[idx] = template;
  } else {
    templates.push(template);
  }
  setItem(TEMPLATES_KEY, templates);
}

export function deleteTemplate(id: string): void {
  const templates = getItem<Template>(TEMPLATES_KEY).filter(
    (t) => t.id !== id
  );
  setItem(TEMPLATES_KEY, templates);
}
