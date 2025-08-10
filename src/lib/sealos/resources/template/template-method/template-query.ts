"use client";

import { queryOptions } from "@tanstack/react-query";
import { runParallelAction } from "next-server-actions-parallel";
import type {
  TemplateApiContext,
  ListTemplateResponse,
  TemplateSourceResponse,
} from "../schemas/template-api-context-schemas";
import {
  getTemplateSource,
  listTemplates,
} from "../template-api/template-old-api";

export const listTemplatesOptions = (
  context: TemplateApiContext,
  postprocess?: (data: ListTemplateResponse) => unknown
) =>
  queryOptions({
    queryKey: ["templates"],
    queryFn: () => runParallelAction(listTemplates(context)),
    select: (data) => postprocess?.(data) ?? data,
    enabled: !!context.baseURL,
  });

export const getTemplateSourceOptions = (
  context: TemplateApiContext,
  templateName: string,
  postprocess?: (data: TemplateSourceResponse) => unknown
) =>
  queryOptions({
    queryKey: ["template", templateName],
    queryFn: () => runParallelAction(getTemplateSource(context, templateName)),
    select: (data) => postprocess?.(data) ?? data,
    enabled: !!context.baseURL && !!templateName,
  });
