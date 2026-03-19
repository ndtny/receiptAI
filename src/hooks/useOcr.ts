"use client";

import { useState, useCallback, useRef } from "react";
import { OcrProgress, Region } from "@/types";
import { recognizeFull, recognizeRegion, terminateWorker } from "@/lib/ocr";

export function useOcr() {
  const [progress, setProgress] = useState<OcrProgress>({
    status: "idle",
    progress: 0,
    message: "",
  });
  const [result, setResult] = useState<string>("");
  const abortRef = useRef(false);

  const recognizeImage = useCallback(async (image: string) => {
    abortRef.current = false;
    setProgress({ status: "loading", progress: 0, message: "Starting OCR..." });
    try {
      const text = await recognizeFull(image, (p) => {
        if (!abortRef.current) setProgress(p);
      });
      if (!abortRef.current) {
        setResult(text);
        setProgress({ status: "done", progress: 1, message: "Done" });
      }
      return text;
    } catch (err) {
      const message = err instanceof Error ? err.message : "OCR failed";
      setProgress({ status: "error", progress: 0, message });
      return "";
    }
  }, []);

  const recognizeArea = useCallback(
    async (
      image: string,
      region: Region,
      imageWidth: number,
      imageHeight: number
    ) => {
      try {
        const text = await recognizeRegion(
          image,
          region,
          imageWidth,
          imageHeight,
          setProgress
        );
        return text.trim();
      } catch {
        return "";
      }
    },
    []
  );

  const reset = useCallback(() => {
    abortRef.current = true;
    setProgress({ status: "idle", progress: 0, message: "" });
    setResult("");
  }, []);

  const cleanup = useCallback(() => {
    terminateWorker();
  }, []);

  return { progress, result, recognizeImage, recognizeArea, reset, cleanup };
}
