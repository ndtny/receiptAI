"use client";

import { useRef, useState, useCallback } from "react";
import { compressImage } from "@/lib/image";
import { pdfToImage } from "@/lib/pdf";
import { useToast } from "./Toast";

interface Props {
  onImageCaptured: (base64: string) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "application/pdf"];

export default function ImageCapture({ onImageCaptured }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  function validateFile(file: File): boolean {
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      toast("Please upload an image or PDF file", "error");
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast("File too large — maximum size is 10 MB", "error");
      return false;
    }
    return true;
  }

  async function processFile(file: File) {
    if (!validateFile(file)) return;
    try {
      const base64 = file.type === "application/pdf"
        ? await pdfToImage(file)
        : await compressImage(file);
      setPreview(base64);
      onImageCaptured(base64);
    } catch {
      toast("Failed to process file. Please try another one.", "error");
    }
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await processFile(file);
  }, []);

  if (preview) {
    return (
      <div className="animate-fade-in rounded-xl overflow-hidden border border-gray-200 shadow-sm">
        <img src={preview} alt="Receipt preview" className="w-full" />
        <div className="bg-white px-4 py-3 text-center">
          <p className="text-sm text-gray-500">Processing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-fade-in">
      <input ref={fileRef} type="file" accept="image/*,application/pdf" onChange={handleFile} className="hidden" aria-label="Upload receipt image or PDF" />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" aria-label="Take photo of receipt" />

      <button
        onClick={() => fileRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-full rounded-xl border-2 border-dashed px-6 py-12 text-center transition-all duration-200 ${
          dragging
            ? "border-blue-500 bg-blue-50 scale-[1.01]"
            : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/50 bg-white"
        }`}
        style={dragging ? {} : { borderImage: "linear-gradient(135deg, #2563eb, #7c3aed) 1" }}
      >
        <svg className="mx-auto w-12 h-12 text-blue-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        <p className="text-sm font-medium text-gray-700">
          {dragging ? "Drop your image here" : "Click or drag & drop to upload"}
        </p>
        <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP, PDF — up to 10 MB</p>
      </button>

      <button
        onClick={() => cameraRef.current?.click()}
        className="w-full rounded-xl border border-gray-200 bg-white px-6 py-4 text-center transition hover:bg-gray-50 shadow-sm sm:hidden"
      >
        <svg className="mx-auto w-8 h-8 text-purple-500 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
        </svg>
        <span className="text-sm text-gray-600">Take Photo</span>
      </button>
    </div>
  );
}
