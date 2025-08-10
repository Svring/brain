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

export const getSshConnectionInfo = createParallelAction(
  async (context: DevboxApiContext, name: string) => {
    const api = createDevboxApi(context);
    const response = await api.get("/getSSHConnectionInfo", {
      params: {
        devboxName: name,
      },
    });
    return response.data;
  }
);

export const deleteDevboxRelease = createParallelAction(
  async (context: DevboxApiContext, versionName: string) => {
    const api = createDevboxApi(context);
    const response = await api.delete("/delDevboxVersionByName", {
      params: {
        versionName,
      },
    });
    return response.data;
  }
);
