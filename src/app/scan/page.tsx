"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ExtractedFields, FieldType, FieldMapping, Region } from "@/types";
import { useOcr } from "@/hooks/useOcr";
import { parseReceipt } from "@/lib/parser";
import { getImageDimensions } from "@/lib/image";
import { saveReceipt } from "@/lib/storage";
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

export default function ScanPage() {
  const router = useRouter();
  const { progress, recognizeImage, recognizeArea } = useOcr();
  const [image, setImage] = useState<string | null>(null);
  const [rawText, setRawText] = useState("");
  const [fields, setFields] = useState<ExtractedFields>(emptyFields);
  const [activeField, setActiveField] = useState<FieldType | null>(null);
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [imgDims, setImgDims] = useState({ width: 0, height: 0 });
  const [step, setStep] = useState<"capture" | "ocr" | "edit">("capture");

  const handleImageCaptured = useCallback(
    async (base64: string) => {
      setImage(base64);
      setStep("ocr");
      const dims = await getImageDimensions(base64);
      setImgDims(dims);
      const text = await recognizeImage(base64);
      if (text) {
        setRawText(text);
        setFields(parseReceipt(text));
        setStep("edit");
      }
    },
    [recognizeImage]
  );

  const handleRegionSelected = useCallback(
    async (region: Region, fieldType: FieldType) => {
      if (!image) return;
      setActiveField(null);
      const text = await recognizeArea(
        image,
        region,
        imgDims.width,
        imgDims.height
      );
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
        const text = await recognizeArea(
          image,
          m.region,
          imgDims.width,
          imgDims.height
        );
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
    router.push("/");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Scan Receipt</h1>
        <button
          onClick={() => router.push("/")}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back
        </button>
      </div>

      {step === "capture" && (
        <ImageCapture onImageCaptured={handleImageCaptured} />
      )}

      {step === "ocr" && (
        <div className="space-y-4">
          {image && (
            <img
              src={image}
              alt="Receipt being processed"
              className="w-full rounded-lg"
            />
          )}
          <OcrProcessor progress={progress} />
        </div>
      )}

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
              onClick={() => {
                setImage(null);
                setFields(emptyFields);
                setRawText("");
                setMappings([]);
                setStep("capture");
              }}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Scan Another
            </button>
            <button
              onClick={handleSave}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Save Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

