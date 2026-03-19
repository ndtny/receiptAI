"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ExtractedFields, FieldType, FieldMapping, Region } from "@/types";
import { useOcr } from "@/hooks/useOcr";
import { parseReceipt } from "@/lib/parser";
import { getImageDimensions } from "@/lib/image";
import { saveReceipt } from "@/lib/storage";
import { useToast } from "@/components/Toast";
import ImageCapture from "@/components/ImageCapture";
import OcrProcessor from "@/components/OcrProcessor";
import RegionSelector from "@/components/RegionSelector";
import FieldEditor from "@/components/FieldEditor";
import TemplateManager from "@/components/TemplateManager";

const emptyFields: ExtractedFields = {
  vendor: "",
  date: "",
  total: "",
  tax: "",
  currency: "USD",
  category: "",
  notes: "",
};

const STEPS = [
  { key: "capture", label: "Upload", icon: "1" },
  { key: "ocr", label: "OCR", icon: "2" },
  { key: "edit", label: "Edit", icon: "3" },
] as const;

export default function ScanPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { progress, recognizeImage, recognizeArea } = useOcr();
  const [image, setImage] = useState<string | null>(null);
  const [rawText, setRawText] = useState("");
  const [fields, setFields] = useState<ExtractedFields>(emptyFields);
  const [activeField, setActiveField] = useState<FieldType | null>(null);
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [imgDims, setImgDims] = useState({ width: 0, height: 0 });
  const [step, setStep] = useState<"capture" | "ocr" | "edit">("capture");
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [emptyOcr, setEmptyOcr] = useState(false);

  const handleImageCaptured = useCallback(
    async (base64: string) => {
      setImage(base64);
      setStep("ocr");
      setOcrError(null);
      setEmptyOcr(false);
      try {
        const dims = await getImageDimensions(base64);
        setImgDims(dims);
        const text = await recognizeImage(base64);
        if (!text || !text.trim()) {
          setEmptyOcr(true);
          setStep("ocr");
          return;
        }
        setRawText(text);
        setFields(parseReceipt(text));
        setStep("edit");
      } catch (err) {
        const message = err instanceof Error ? err.message : "OCR processing failed";
        setOcrError(message);
      }
    },
    [recognizeImage]
  );

  const handleRetry = useCallback(() => {
    if (image) {
      setOcrError(null);
      setEmptyOcr(false);
      handleImageCaptured(image);
    }
  }, [image, handleImageCaptured]);

  const handleRestart = useCallback(() => {
    setImage(null);
    setFields(emptyFields);
    setRawText("");
    setMappings([]);
    setOcrError(null);
    setEmptyOcr(false);
    setStep("capture");
  }, []);

  const handleRegionSelected = useCallback(
    async (region: Region, fieldType: FieldType) => {
      if (!image) return;
      setActiveField(null);
      const text = await recognizeArea(image, region, imgDims.width, imgDims.height);
      if (text) {
        setFields((prev) => ({ ...prev, [fieldType]: text }));
        setMappings((prev) => [
          ...prev.filter((m) => m.fieldType !== fieldType),
          { fieldType, region },
        ]);
      }
    },
    [image, imgDims, recognizeArea]
  );

  const handleApplyTemplate = useCallback(
    async (templateMappings: FieldMapping[]) => {
      if (!image) return;
      setMappings(templateMappings);
      for (const m of templateMappings) {
        const text = await recognizeArea(image, m.region, imgDims.width, imgDims.height);
        if (text) {
          setFields((prev) => ({ ...prev, [m.fieldType]: text }));
        }
      }
    },
    [image, imgDims, recognizeArea]
  );

  function handleSave() {
    if (!image) return;
    saveReceipt({
      id: crypto.randomUUID(),
      imageBase64: image,
      fields,
      rawText,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    toast("Receipt saved successfully", "success");
    router.push("/");
  }

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Scan Receipt</h1>
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back
        </button>
      </div>

      {/* Step indicator */}
      <div className="mb-6 flex items-center justify-center gap-0" role="navigation" aria-label="Scan progress">
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex items-center">
            <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
              i < stepIndex ? "bg-emerald-100 text-emerald-700" :
              i === stepIndex ? "bg-blue-100 text-blue-700" :
              "bg-gray-100 text-gray-400"
            }`}>
              {i < stepIndex ? (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : (
                <span>{s.icon}</span>
              )}
              {s.label}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-8 h-0.5 mx-1 ${i < stepIndex ? "bg-emerald-300" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Capture step */}
      {step === "capture" && (
        <ImageCapture onImageCaptured={handleImageCaptured} />
      )}

      {/* OCR step */}
      {step === "ocr" && (
        <div className="space-y-4">
          {image && !ocrError && !emptyOcr && (
            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm animate-fade-in">
              <img src={image} alt="Receipt being processed" className="w-full" />
            </div>
          )}
          {!ocrError && !emptyOcr && <OcrProcessor progress={progress} />}

          {/* OCR error card */}
          {ocrError && (
            <div className="rounded-xl border-2 border-red-200 bg-red-50 p-6 animate-slide-up">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <div>
                  <p className="font-medium text-red-800">OCR Processing Failed</p>
                  <p className="text-sm text-red-600 mt-1">{ocrError}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button onClick={handleRetry} className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition">
                  Retry OCR
                </button>
                <button onClick={handleRestart} className="flex-1 rounded-lg border border-red-300 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-100 transition">
                  Upload New Image
                </button>
              </div>
            </div>
          )}

          {/* Empty OCR result */}
          {emptyOcr && (
            <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-6 animate-slide-up">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                </svg>
                <div>
                  <p className="font-medium text-amber-800">No text detected</p>
                  <p className="text-sm text-amber-700 mt-1">The OCR engine could not find any text in this image. Try:</p>
                  <ul className="text-sm text-amber-600 mt-2 space-y-1 list-disc list-inside">
                    <li>Use a clearer, higher-resolution image</li>
                    <li>Ensure good lighting and contrast</li>
                    <li>Make sure text is facing upward</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button onClick={handleRetry} className="flex-1 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-700 transition">
                  Retry
                </button>
                <button onClick={handleRestart} className="flex-1 rounded-lg border border-amber-300 px-4 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber-100 transition">
                  Upload New Image
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit step */}
      {step === "edit" && image && (
        <div className="space-y-6">
          <RegionSelector
            imageSrc={image}
            onRegionSelected={handleRegionSelected}
            activeField={activeField}
          />
          <FieldEditor
            fields={fields}
            onChange={setFields}
            onSelectField={setActiveField}
            activeField={activeField}
          />
          <TemplateManager
            currentMappings={mappings}
            onApplyTemplate={handleApplyTemplate}
          />
          <div className="flex gap-3">
            <button
              onClick={handleRestart}
              className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Scan Another
            </button>
            <button
              onClick={handleSave}
              className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:shadow-md transition-shadow"
            >
              Save Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
