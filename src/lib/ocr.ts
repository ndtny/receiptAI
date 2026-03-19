import { OcrProgress, Region } from "@/types";
import Tesseract, { createWorker } from "tesseract.js";

let worker: Tesseract.Worker | null = null;

async function getWorker(
  onProgress?: (progress: OcrProgress) => void
): Promise<Tesseract.Worker> {
  if (worker) return worker;

  onProgress?.({
    status: "loading",
    progress: 0,
    message: "Loading OCR engine...",
  });

  const w = await createWorker("eng", undefined, {
    logger: (m) => {
      if (m.status === "recognizing text") {
        onProgress?.({
          status: "recognizing",
          progress: m.progress,
          message: "Recognizing text...",
        });
      }
    },
  });

  worker = w;
  return w;
}

export async function recognizeFull(
  image: string,
  onProgress?: (progress: OcrProgress) => void
): Promise<string> {
  const w = await getWorker(onProgress);
  const { data } = await w.recognize(image);
  onProgress?.({ status: "done", progress: 1, message: "Done" });
  return data.text;
}

export async function recognizeRegion(
  image: string,
  region: Region,
  imageWidth: number,
  imageHeight: number,
  onProgress?: (progress: OcrProgress) => void
): Promise<string> {
  const w = await getWorker(onProgress);
  const rectangle = {
    left: Math.round(region.x * imageWidth),
    top: Math.round(region.y * imageHeight),
    width: Math.round(region.width * imageWidth),
    height: Math.round(region.height * imageHeight),
  };
  const { data } = await w.recognize(image, { rectangle });
  onProgress?.({ status: "done", progress: 1, message: "Done" });
  return data.text;
}

export async function terminateWorker(): Promise<void> {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
}
