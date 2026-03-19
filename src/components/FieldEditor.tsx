"use client";

import { ExtractedFields, FieldType } from "@/types";

interface Props {
  fields: ExtractedFields;
  onChange: (fields: ExtractedFields) => void;
  onSelectField: (field: FieldType | null) => void;
  activeField: FieldType | null;
}

const FIELD_CONFIG: { key: FieldType; label: string; placeholder: string }[] = [
  { key: "vendor", label: "Vendor", placeholder: "Store name" },
  { key: "date", label: "Date", placeholder: "MM/DD/YYYY" },
  { key: "total", label: "Total", placeholder: "0.00" },
  { key: "tax", label: "Tax", placeholder: "0.00" },
  { key: "currency", label: "Currency", placeholder: "USD" },
  { key: "category", label: "Category", placeholder: "e.g. Office, Travel" },
  { key: "notes", label: "Notes", placeholder: "Optional notes" },
];

export default function FieldEditor({
  fields,
  onChange,
  onSelectField,
  activeField,
}: Props) {
  function handleChange(key: FieldType, value: string) {
    onChange({ ...fields, [key]: value });
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">Extracted Fields</h3>
      {FIELD_CONFIG.map(({ key, label, placeholder }) => (
        <div key={key} className="flex items-center gap-2">
          <label className="w-20 text-sm text-gray-600 shrink-0" htmlFor={`field-${key}`}>
            {label}
          </label>
          <input
            id={`field-${key}`}
            type="text"
            value={fields[key]}
            onChange={(e) => handleChange(key, e.target.value)}
            placeholder={placeholder}
            className="flex-1 rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          <button
            type="button"
            onClick={() =>
              onSelectField(activeField === key ? null : key)
            }
            className={`shrink-0 rounded px-2 py-1.5 text-xs transition ${
              activeField === key
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            title={`Select region for ${label}`}
            aria-label={`Select region for ${label}`}
          >
            ⊞
          </button>
        </div>
      ))}
    </div>
  );
}
