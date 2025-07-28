"use server";

import axios from "axios";
import { createParallelAction } from "next-server-actions-parallel";
import https from "https";
import { DevboxApiContext } from "../devbox-schemas/devbox-api-context-schema";

function createDevboxApi(context: DevboxApiContext) {
  const isDevelopment = process.env.NEXT_PUBLIC_MODE === "development";
  return axios.create({
    baseURL: `https://devbox.${context.baseURL}/api/`,
    headers: {
      "Content-Type": "application/json",
      ...(context.authorization
        ? { Authorization: context.authorization }
        : {}),
      ...(context.authorizationBearer
        ? { "Authorization-Bearer": context.authorizationBearer }
        : {}),
    },
    httpsAgent: isDevelopment
      ? new https.Agent({ rejectUnauthorized: false })
      : undefined,
  });
}

export const listTemplates = createParallelAction(
  async (context: DevboxApiContext) => {
    const api = createDevboxApi(context);
    const response = await api.get("/templateRepository/listOfficial");
    return response.data;
  }
);

export const listTemplateVersions = createParallelAction(
  async (context: DevboxApiContext, templateRepositoryUid: string) => {
    const api = createDevboxApi(context);
    const response = await api.get("/templateRepository/template/list", {
      params: {
        templateRepositoryUid,
      },
    });
    return response.data;
  }
);
