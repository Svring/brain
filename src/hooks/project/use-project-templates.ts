"use client";

import { useQuery } from "@tanstack/react-query";
import { createTemplateApiContext } from "@/lib/sealos/template/template-method/template-utils";
import { listTemplatesOptions } from "@/lib/sealos/template/template-method/template-query";

export function useProjectTemplates() {
  return useQuery(listTemplatesOptions(createTemplateApiContext()));
}
