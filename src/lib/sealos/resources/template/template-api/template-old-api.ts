"use server";

import axios from "axios";
import { createParallelAction } from "next-server-actions-parallel";
import type {
  TemplateApiContext,
  ListTemplateResponse,
  TemplateSourceResponse,
  TemplateResponseV1,
} from "../schemas/template-api-context-schemas";
import {
  ListTemplateResponseSchema,
  TemplateSourceResponseSchema,
  TemplateResponseSchemaV1,
} from "../schemas/template-api-context-schemas";
import {
  type CreateInstanceRequest,
  CreateInstanceRequestSchema,
  type CreateInstanceResponse,
  CreateInstanceResponseSchema,
} from "../schemas/template-create-instance-schemas";
import https from "https";

function createApi(context: TemplateApiContext) {
  const isDevelopment = process.env.NEXT_PUBLIC_MODE === "development";
  return axios.create({
    baseURL: `http://template.${context.baseUrl}/api`,
    headers: {
      "Content-Type": "application/json",
      ...(context.authorization
        ? { Authorization: context.authorization }
        : {}),
    },
    httpsAgent: isDevelopment
      ? new https.Agent({ rejectUnauthorized: false })
      : undefined,
  });
}

export const listTemplates = createParallelAction(
  async (context: TemplateApiContext): Promise<ListTemplateResponse> => {
    const api = createApi(context);
    const response = await api.get("/listTemplate?language=en");
    return ListTemplateResponseSchema.parse(response.data);
  }
);

export const getTemplateSource = createParallelAction(
  async (
    context: TemplateApiContext,
    templateName: string
  ): Promise<TemplateResponseV1> => {
    const api = createApi(context);
    const response = await api.get(`/v1/template/${templateName}`);
    try {
      return TemplateResponseSchemaV1.parse(response.data);
    } catch (error) {
      console.error("Schema validation failed:", error);
      return response.data as TemplateResponseV1;
    }
  }
);

export const createInstance = createParallelAction(
  async (
    request: CreateInstanceRequest,
    context: TemplateApiContext
  ): Promise<CreateInstanceResponse> => {
    const validatedRequest = CreateInstanceRequestSchema.parse(request);
    const api = createApi(context);
    const response = await api.post(
      "/v1alpha/createInstance",
      validatedRequest
    );
    return CreateInstanceResponseSchema.parse(response.data);
  }
);
