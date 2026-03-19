"use client";

import { useRef } from "react";
import { compressImage } from "@/lib/image";

interface Props {
  onImageCaptured: (base64: string) => void;
}

export default function ImageCapture({ onImageCaptured }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await compressImage(file);
    onImageCaptured(base64);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
        aria-label="Upload receipt image"
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="hidden"
        aria-label="Take photo of receipt"
      />
      <button
        onClick={() => fileRef.current?.click()}
        className="flex-1 rounded-lg border-2 border-dashed border-gray-300 px-6 py-8 text-center transition hover:border-blue-400 hover:bg-blue-50"
      >
        <span className="block text-2xl mb-1">📁</span>
        <span className="text-sm text-gray-600">Upload Image</span>
      </button>
      <button
        onClick={() => cameraRef.current?.click()}
        className="flex-1 rounded-lg border-2 border-dashed border-gray-300 px-6 py-8 text-center transition hover:border-blue-400 hover:bg-blue-50 sm:hidden"
      >
        <span className="block text-2xl mb-1">📷</span>
        <span className="text-sm text-gray-600">Take Photo</span>
      </button>
    </div>
  );
}
