"use client";

import { useState, useCallback, useEffect } from "react";
import { Receipt } from "@/types";
import {
  getReceipts,
  saveReceipt,
  deleteReceipt as removeReceipt,
} from "@/lib/storage";

export function useReceipts() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);

  useEffect(() => {
    setReceipts(getReceipts());
  }, []);

  const addReceipt = useCallback((receipt: Receipt) => {
    saveReceipt(receipt);
    setReceipts(getReceipts());
  }, []);

  const updateReceipt = useCallback((receipt: Receipt) => {
    saveReceipt(receipt);
    setReceipts(getReceipts());
  }, []);

  const deleteReceipt = useCallback((id: string) => {
    removeReceipt(id);
    setReceipts(getReceipts());
  }, []);

  const refresh = useCallback(() => {
    setReceipts(getReceipts());
  }, []);

  return { receipts, addReceipt, updateReceipt, deleteReceipt, refresh };
}
