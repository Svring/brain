"use server";

import axios from "axios";
import { createParallelAction } from "next-server-actions-parallel";
import type {
  InstanceApiContext,
  ListTemplateResponse,
} from "./schemas/instance-api-context-schemas";
import { ListTemplateResponseSchema } from "./schemas/instance-api-context-schemas";

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
