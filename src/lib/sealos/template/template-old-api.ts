"use server";

import axios from "axios";
import { createParallelAction } from "next-server-actions-parallel";
import type {
  InstanceApiContext,
  ListTemplateResponse,
  TemplateSourceResponse,
} from "./schemas/template-api-context-schemas";
import {
  ListTemplateResponseSchema,
  TemplateSourceResponseSchema,
} from "./schemas/template-api-context-schemas";
import {
  type CreateInstanceRequest,
  CreateInstanceRequestSchema,
  type CreateInstanceResponse,
  CreateInstanceResponseSchema,
} from "./schemas/template-create-instance-schemas";

function createApi(context: InstanceApiContext) {
  return axios.create({
    baseURL: `https://template.${context.baseURL}/api`,
    headers: {
      "Content-Type": "application/json",
      ...(context.authorization
        ? { Authorization: context.authorization }
        : {}),
    },
  });
}

export const listTemplates = createParallelAction(
  async (context: InstanceApiContext): Promise<ListTemplateResponse> => {
    const api = createApi(context);
    const response = await api.get("/listTemplate?language=en");
    return ListTemplateResponseSchema.parse(response.data);
  }
);

export const getTemplateSource = createParallelAction(
  async (
    context: InstanceApiContext,
    templateName: string
  ): Promise<TemplateSourceResponse> => {
    const api = createApi(context);
    const response = await api.get(
      `/getTemplateSource?templateName=${templateName}`
    );
    return TemplateSourceResponseSchema.parse(response.data);
  }
);

export const createInstance = createParallelAction(
  async (
    request: CreateInstanceRequest,
    context: InstanceApiContext
  ): Promise<CreateInstanceResponse> => {
    const validatedRequest = CreateInstanceRequestSchema.parse(request);
    const api = createApi(context);
    const response = await api.post(
      "/v1alpha1/createInstance",
      validatedRequest
    );
    return CreateInstanceResponseSchema.parse(response.data);
  }
);
