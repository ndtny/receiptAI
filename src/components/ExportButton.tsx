"use client";

import { useState } from "react";
import { Receipt } from "@/types";
import { exportToExcel, exportToCsv } from "@/lib/export";

interface Props {
  receipts: Receipt[];
}

export default function ExportButton({ receipts }: Props) {
  const [open, setOpen] = useState(false);

  if (receipts.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
      >
        Export ({receipts.length})
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-10 rounded-lg border bg-white shadow-lg">
          <button
            onClick={() => {
              exportToExcel(receipts);
              setOpen(false);
            }}
            className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
          >
            Excel (.xlsx)
          </button>
          <button
            onClick={() => {
              exportToCsv(receipts);
              setOpen(false);
            }}
            className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
          >
            CSV (.csv)
          </button>
        </div>
      )}
    </div>
  );
}
