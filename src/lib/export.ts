import { Receipt } from "@/types";
import * as XLSX from "xlsx";

function receiptToRow(r: Receipt) {
  return {
    Vendor: r.fields.vendor,
    Date: r.fields.date,
    Total: r.fields.total,
    Tax: r.fields.tax,
    Currency: r.fields.currency,
    Category: r.fields.category,
    Notes: r.fields.notes,
  };
}

export function exportToExcel(receipts: Receipt[], filename = "receipts") {
  const rows = receipts.map(receiptToRow);
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Receipts");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportToCsv(receipts: Receipt[], filename = "receipts") {
  const rows = receipts.map(receiptToRow);
  const ws = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
