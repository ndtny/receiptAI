"use client";

import { OcrProgress } from "@/types";

interface Props {
  progress: OcrProgress;
  onRetry?: () => void;
}

const stageIcons: Record<string, { icon: React.ReactNode; color: string }> = {
  loading: {
    icon: (
      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    ),
    color: "text-blue-500",
  },
  recognizing: {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: "text-indigo-500",
  },
  done: {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "text-emerald-500",
  },
  error: {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    ),
    color: "text-red-500",
  },
};

export default function OcrProcessor({ progress, onRetry }: Props) {
  if (progress.status === "idle") return null;

  const pct = Math.round(progress.progress * 100);
  const stage = stageIcons[progress.status] || stageIcons.loading;

  if (progress.status === "error") {
    return (
      <div className="rounded-xl border-2 border-red-200 bg-red-50 p-5 animate-fade-in">
        <div className="flex items-start gap-3">
          <div className="text-red-500 mt-0.5">{stage.icon}</div>
          <div className="flex-1">
            <p className="font-medium text-red-800">OCR Processing Failed</p>
            <p className="text-sm text-red-600 mt-1">{progress.message}</p>
          </div>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition"
          >
            Retry OCR
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white border border-gray-200 p-5 shadow-sm animate-fade-in" role="status" aria-live="polite">
      <div className="flex items-center gap-3 mb-3">
        <div className={stage.color}>{stage.icon}</div>
        <span className="text-sm font-medium text-gray-700 flex-1">{progress.message}</span>
        {progress.status === "done" ? (
          <span className="text-sm font-medium text-emerald-600">Complete</span>
        ) : (
          <span className="text-sm text-gray-400">{pct}%</span>
        )}
      </div>
      <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            progress.status === "done"
              ? "bg-emerald-500"
              : "bg-gradient-to-r from-blue-500 to-indigo-500 animate-progress-stripe"
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
