export interface Region {
  x: number; // 0-1 normalized
  y: number;
  width: number;
  height: number;
}

export type FieldType = "vendor" | "date" | "total" | "tax" | "currency" | "category" | "notes";

export interface ExtractedFields {
  vendor: string;
  date: string;
  total: string;
  tax: string;
  currency: string;
  category: string;
  notes: string;
}

export interface FieldMapping {
  fieldType: FieldType;
  region: Region;
}

export interface Receipt {
  id: string;
  imageBase64: string;
  fields: ExtractedFields;
  rawText: string;
  createdAt: number;
  updatedAt: number;
}

export interface Template {
  id: string;
  name: string;
  mappings: FieldMapping[];
  createdAt: number;
}

export interface OcrProgress {
  status: "idle" | "loading" | "recognizing" | "done" | "error";
  progress: number; // 0-1
  message: string;
}
