"use client";

import { useState } from "react";
import { Receipt } from "@/types";
import ConfirmDialog from "./ConfirmDialog";

interface Props {
  receipt: Receipt;
  onDelete: (id: string) => void;
}

export default function ReceiptCard({ receipt, onDelete }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md animate-fade-in">
        <img
          src={receipt.imageBase64}
          alt={`Receipt from ${receipt.fields.vendor || "unknown vendor"}`}
          className="h-16 w-16 shrink-0 rounded-lg object-cover"
        />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">
            {receipt.fields.vendor || "Unknown Vendor"}
          </p>
          <p className="text-sm text-gray-500">
            {receipt.fields.date || "No date"}
          </p>
          {receipt.fields.category && (
            <span className="mt-1 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600 font-medium">
              {receipt.fields.category}
            </span>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-bold text-gray-900">
            {receipt.fields.currency} {receipt.fields.total || "—"}
          </p>
          <button
            onClick={() => setConfirmOpen(true)}
            className="mt-1 text-xs text-gray-400 hover:text-red-500 transition"
            aria-label={`Delete receipt from ${receipt.fields.vendor || "unknown vendor"}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title="Delete this receipt?"
        message={`This will permanently remove the receipt from ${receipt.fields.vendor || "unknown vendor"}. This action cannot be undone.`}
        onConfirm={() => {
          setConfirmOpen(false);
          onDelete(receipt.id);
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
