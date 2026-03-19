"use client";

import { Receipt } from "@/types";

interface Props {
  receipt: Receipt;
  onDelete: (id: string) => void;
}

export default function ReceiptCard({ receipt, onDelete }: Props) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <img
        src={receipt.imageBase64}
        alt={`Receipt from ${receipt.fields.vendor || "unknown vendor"}`}
        className="h-16 w-16 shrink-0 rounded object-cover"
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">
          {receipt.fields.vendor || "Unknown Vendor"}
        </p>
        <p className="text-sm text-gray-500">
          {receipt.fields.date || "No date"} &middot;{" "}
          {receipt.fields.currency} {receipt.fields.total || "—"}
        </p>
        {receipt.fields.category && (
          <span className="mt-1 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
            {receipt.fields.category}
          </span>
        )}
      </div>
      <button
        onClick={() => onDelete(receipt.id)}
        className="shrink-0 text-gray-400 hover:text-red-500 transition"
        aria-label={`Delete receipt from ${receipt.fields.vendor || "unknown vendor"}`}
      >
        ✕
      </button>
    </div>
  );
}
