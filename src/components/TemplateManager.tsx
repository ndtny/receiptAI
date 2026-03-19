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
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Templates
        </h4>
        {currentMappings.length > 0 && (
          <button
            onClick={() => setShowSave(!showSave)}
            className="text-xs text-blue-600 hover:underline"
          >
            Save as template
          </button>
        )}
      </div>

      {showSave && (
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Template name"
            className="flex-1 rounded border px-2 py-1 text-sm"
            aria-label="Template name"
          />
          <button
            onClick={handleSave}
            className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      )}

      {templates.length > 0 && (
        <div className="space-y-1">
          {templates.map((t: Template) => (
            <div
              key={t.id}
              className="flex items-center justify-between rounded bg-gray-50 px-3 py-1.5"
            >
              <button
                onClick={() => onApplyTemplate(t.mappings)}
                className="text-sm text-gray-700 hover:text-blue-600"
              >
                {t.name}{" "}
                <span className="text-xs text-gray-400">
                  ({t.mappings.length} fields)
                </span>
              </button>
              <button
                onClick={() => deleteTemplate(t.id)}
                className="text-xs text-gray-400 hover:text-red-500"
                aria-label={`Delete template ${t.name}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
