"use client";

import { useState } from "react";
import { Template, FieldMapping } from "@/types";
import { useTemplates } from "@/hooks/useTemplates";

interface Props {
  currentMappings: FieldMapping[];
  onApplyTemplate: (mappings: FieldMapping[]) => void;
}

export default function TemplateManager({
  currentMappings,
  onApplyTemplate,
}: Props) {
  const { templates, addTemplate, deleteTemplate } = useTemplates();
  const [showSave, setShowSave] = useState(false);
  const [name, setName] = useState("");

  function handleSave() {
    if (!name.trim() || currentMappings.length === 0) return;
    addTemplate({
      id: crypto.randomUUID(),
      name: name.trim(),
      mappings: currentMappings,
      createdAt: Date.now(),
    });
    setName("");
    setShowSave(false);
  }

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Templates
        </h4>
        {currentMappings.length > 0 && (
          <button
            onClick={() => setShowSave(!showSave)}
            className="text-xs text-blue-600 hover:underline font-medium"
          >
            + Save as template
          </button>
        )}
      </div>

      {showSave && (
        <div className="flex gap-2 animate-slide-up">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Template name"
            className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
            aria-label="Template name"
          />
          <button
            onClick={handleSave}
            className="rounded-lg bg-blue-500 px-4 py-1.5 text-sm text-white hover:bg-blue-600 transition font-medium"
          >
            Save
          </button>
        </div>
      )}

      {templates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 py-6 text-center">
          <svg className="mx-auto w-8 h-8 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <p className="text-xs text-gray-400">No templates yet. Map fields and save a template for reuse.</p>
        </div>
      ) : (
        <div className="grid gap-2">
          {templates.map((t: Template) => (
            <div
              key={t.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => onApplyTemplate(t.mappings)}
                className="text-sm text-gray-700 hover:text-blue-600 transition font-medium text-left"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  {t.name}
                </span>
                <span className="text-xs text-gray-400 ml-6">
                  {t.mappings.length} field{t.mappings.length !== 1 ? "s" : ""}
                </span>
              </button>
              <button
                onClick={() => deleteTemplate(t.id)}
                className="text-gray-400 hover:text-red-500 transition p-1"
                aria-label={`Delete template ${t.name}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
