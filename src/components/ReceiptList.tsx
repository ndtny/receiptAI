"use client";

import { Receipt } from "@/types";
import ReceiptCard from "./ReceiptCard";

interface Props {
  receipts: Receipt[];
  onDelete: (id: string) => void;
}

export default function ReceiptList({ receipts, onDelete }: Props) {
  if (receipts.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-200 py-16 text-center animate-fade-in">
        <svg className="mx-auto w-16 h-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
        </svg>
        <p className="text-gray-500 font-medium">No receipts yet</p>
        <p className="text-gray-400 text-sm mt-1">
          Scan your first receipt to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {receipts.map((r, i) => (
        <div key={r.id} className="animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
          <ReceiptCard receipt={r} onDelete={onDelete} />
        </div>
      ))}
    </div>
  );
}
