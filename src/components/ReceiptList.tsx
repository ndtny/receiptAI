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
      <div className="rounded-lg border-2 border-dashed border-gray-200 py-12 text-center">
        <p className="text-gray-400 text-sm">No receipts yet</p>
        <p className="text-gray-400 text-xs mt-1">
          Scan your first receipt to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {receipts.map((r) => (
        <ReceiptCard key={r.id} receipt={r} onDelete={onDelete} />
      ))}
    </div>
  );
}
