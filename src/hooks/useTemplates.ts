"use client";

import { useState, useCallback, useEffect } from "react";
import { Template } from "@/types";
import {
  getTemplates,
  saveTemplate,
  deleteTemplate as removeTemplate,
} from "@/lib/storage";

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    setTemplates(getTemplates());
  }, []);

  const addTemplate = useCallback((template: Template) => {
    saveTemplate(template);
    setTemplates(getTemplates());
  }, []);

  const deleteTemplate = useCallback((id: string) => {
    removeTemplate(id);
    setTemplates(getTemplates());
  }, []);

  return { templates, addTemplate, deleteTemplate };
}
