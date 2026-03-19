"use client";

import { OcrProgress } from "@/types";

interface Props {
  progress: OcrProgress;
}

export default function OcrProcessor({ progress }: Props) {
  if (progress.status === "idle") return null;

  const pct = Math.round(progress.progress * 100);

  return (
    <div className="rounded-lg bg-gray-50 p-4" role="status" aria-live="polite">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          {progress.message}
        </span>
        {progress.status === "error" ? (
          <span className="text-sm text-red-500">Error</span>
        ) : progress.status === "done" ? (
          <span className="text-sm text-green-600">Complete</span>
        ) : (
          <span className="text-sm text-gray-500">{pct}%</span>
        )}
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            progress.status === "error"
              ? "bg-red-400"
              : progress.status === "done"
                ? "bg-green-500"
                : "bg-blue-500"
          }`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
