"use client";

import Link from "next/link";
import { useReceipts } from "@/hooks/useReceipts";
import ReceiptList from "@/components/ReceiptList";
import ExportButton from "@/components/ExportButton";

export default function HomePage() {
  const { receipts, deleteReceipt } = useReceipts();

  const totalAmount = receipts.reduce((sum, r) => {
    const val = parseFloat(r.fields.total) || 0;
    return sum + val;
  }, 0);

  const currencies = [...new Set(receipts.map((r) => r.fields.currency).filter(Boolean))];
  const primaryCurrency = currencies[0] || "USD";

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Hero */}
      <div className="mb-6 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 p-6 text-white shadow-lg animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">ReceiptX</h1>
            <p className="text-blue-100 text-sm mt-0.5">Your receipt scanner</p>
          </div>
          <div className="flex items-center gap-2">
            <ExportButton receipts={receipts} />
            <Link
              href="/scan"
              className="rounded-lg bg-white/20 backdrop-blur-sm px-4 py-2 text-sm font-medium text-white transition hover:bg-white/30 shadow-sm"
            >
              + Scan
            </Link>
          </div>
        </div>

        {receipts.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/15 backdrop-blur-sm px-4 py-3">
              <p className="text-2xl font-bold">{receipts.length}</p>
              <p className="text-xs text-blue-100">Receipt{receipts.length !== 1 ? "s" : ""}</p>
            </div>
            <div className="rounded-xl bg-white/15 backdrop-blur-sm px-4 py-3">
              <p className="text-2xl font-bold">{primaryCurrency} {totalAmount.toFixed(2)}</p>
              <p className="text-xs text-blue-100">Total spent</p>
            </div>
          </div>
        )}
      </div>

      {/* Empty state CTA */}
      {receipts.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center animate-slide-up">
          <svg className="mx-auto w-20 h-20 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
          </svg>
          <p className="text-gray-500 font-medium text-lg">No receipts yet</p>
          <p className="text-gray-400 text-sm mt-1 mb-5">Scan your first receipt to get started</p>
          <Link
            href="/scan"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-medium text-white shadow-md hover:shadow-lg transition-shadow"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </svg>
            Scan Receipt
          </Link>
        </div>
      ) : (
        <ReceiptList receipts={receipts} onDelete={deleteReceipt} />
      )}

      {/* Bottom total */}
      {receipts.length > 0 && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex items-center justify-between animate-fade-in">
          <span className="text-sm text-gray-500">{receipts.length} receipt{receipts.length !== 1 ? "s" : ""} total</span>
          <span className="text-lg font-bold text-gray-900">{primaryCurrency} {totalAmount.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}
