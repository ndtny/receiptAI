"use client";

import { ExtractedFields, FieldType } from "@/types";

interface Props {
  fields: ExtractedFields;
  onChange: (fields: ExtractedFields) => void;
  onSelectField: (field: FieldType | null) => void;
  activeField: FieldType | null;
}

const CORE_FIELDS: { key: FieldType; label: string; placeholder: string; icon: React.ReactNode }[] = [
  {
    key: "vendor",
    label: "Vendor",
    placeholder: "Store name",
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016A3.001 3.001 0 0021 9.349m-18 0a2.999 2.999 0 013.397-1.852 2.999 2.999 0 012.79-1.99l.09-.01a2.999 2.999 0 012.79 1.99A2.999 2.999 0 0121 9.35" /></svg>,
  },
  {
    key: "date",
    label: "Date",
    placeholder: "MM/DD/YYYY",
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>,
  },
  {
    key: "total",
    label: "Total",
    placeholder: "0.00",
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  },
  {
    key: "tax",
    label: "Tax",
    placeholder: "0.00",
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>,
  },
  {
    key: "currency",
    label: "Currency",
    placeholder: "USD",
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.893 13.393l-1.135-1.135a2.252 2.252 0 01-.421-.585l-1.08-2.16a.414.414 0 00-.663-.107.827.827 0 01-.812.21l-1.273-.363a.89.89 0 00-.738 1.595l.587.39c.59.395.674 1.23.172 1.732l-.2.2c-.212.212-.33.498-.33.796v.41c0 .409-.11.809-.32 1.158l-1.315 2.191a2.11 2.11 0 01-1.81 1.025 1.055 1.055 0 01-1.055-1.055v-1.172c0-.92-.56-1.747-1.414-2.089l-.655-.261a2.25 2.25 0 01-1.383-2.46l.007-.042a2.25 2.25 0 01.29-.787l.09-.15a2.25 2.25 0 012.37-1.048l1.178.236a1.125 1.125 0 001.302-.795l.208-.73a1.125 1.125 0 00-.578-1.315l-.665-.332-.091.091a2.25 2.25 0 01-1.591.659h-.18a.94.94 0 00-.662.274.931.931 0 01-1.458-1.137l1.411-2.353a2.25 2.25 0 00.286-.76M11.25 2.25L12 2.25" /></svg>,
  },
];

const NOTE_FIELDS: { key: FieldType; label: string; placeholder: string; icon: React.ReactNode }[] = [
  {
    key: "category",
    label: "Category",
    placeholder: "e.g. Office, Travel",
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" /></svg>,
  },
  {
    key: "notes",
    label: "Notes",
    placeholder: "Optional notes",
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>,
  },
];

function FieldGroup({ title, fields, allFields, onChange, onSelectField, activeField }: {
  title: string;
  fields: typeof CORE_FIELDS;
  allFields: ExtractedFields;
  onChange: (fields: ExtractedFields) => void;
  onSelectField: (field: FieldType | null) => void;
  activeField: FieldType | null;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</h4>
      </div>
      <div className="divide-y divide-gray-100">
        {fields.map(({ key, label, placeholder, icon }) => {
          const isEmpty = !allFields[key]?.trim();
          return (
            <div key={key} className={`flex items-center gap-3 px-4 py-3 transition ${isEmpty ? "bg-amber-50/50" : ""}`}>
              <div className={`shrink-0 ${isEmpty ? "text-amber-500" : "text-gray-400"}`}>{icon}</div>
              <label className="w-18 text-sm text-gray-600 shrink-0" htmlFor={`field-${key}`}>{label}</label>
              <input
                id={`field-${key}`}
                type="text"
                value={allFields[key]}
                onChange={(e) => onChange({ ...allFields, [key]: e.target.value })}
                placeholder={placeholder}
                className={`flex-1 rounded-lg border px-3 py-1.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 transition ${
                  isEmpty ? "border-amber-300 bg-white" : "border-gray-200 bg-gray-50"
                }`}
              />
              <button
                type="button"
                onClick={() => onSelectField(activeField === key ? null : key)}
                className={`shrink-0 rounded-lg p-2 text-xs transition ${
                  activeField === key
                    ? "bg-blue-500 text-white shadow-sm"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
                title={`Select region for ${label}`}
                aria-label={`Select region for ${label}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function FieldEditor({ fields, onChange, onSelectField, activeField }: Props) {
  return (
    <div className="space-y-4 animate-slide-up">
      <h3 className="text-sm font-semibold text-gray-700">Extracted Fields</h3>
      <FieldGroup title="Core" fields={CORE_FIELDS} allFields={fields} onChange={onChange} onSelectField={onSelectField} activeField={activeField} />
      <FieldGroup title="Notes" fields={NOTE_FIELDS} allFields={fields} onChange={onChange} onSelectField={onSelectField} activeField={activeField} />
    </div>
  );
}
