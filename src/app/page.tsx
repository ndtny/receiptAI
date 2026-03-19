"use client";

import Link from "next/link";
import { useReceipts } from "@/hooks/useReceipts";
import ReceiptList from "@/components/ReceiptList";
import ExportButton from "@/components/ExportButton";

export default function HomePage() {
  const { receipts, deleteReceipt } = useReceipts();

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">ReceiptX</h1>
          <p className="text-sm text-gray-500">
            {receipts.length} receipt{receipts.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButton receipts={receipts} />
          <Link
            href="/scan"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            + Scan
          </Link>
        </div>
      </div>
      <ReceiptList receipts={receipts} onDelete={deleteReceipt} />
    </div>
  );
}
