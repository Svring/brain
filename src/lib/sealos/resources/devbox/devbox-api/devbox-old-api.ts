"use server";

import axios from "axios";
import { createParallelAction } from "next-server-actions-parallel";
import https from "https";
import { DevboxApiContext } from "../devbox-schemas/devbox-api-context-schema";

function createDevboxApi(context: DevboxApiContext) {
  const isDevelopment = process.env.NEXT_PUBLIC_MODE === "development";
  return axios.create({
    baseURL: `https://devbox.${context.baseUrl}/api/`,
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

export const authCname = createParallelAction(
  async (
    context: DevboxApiContext,
    publicDomain: string,
    customDomain: string
  ) => {
    const api = createDevboxApi(context);
    const response = await api.post("/platform/authCname", {
      publicDomain,
      customDomain,
    });
    return response.data;
  }
);

/**
 * Get monitor data for a devbox
 * @example
 * queryKey: "average_cpu" | "average_memory"
 * queryName(pod name): "devbox-p2hrz"
 * step: "2m"
 */
export const getMonitorData = createParallelAction(
  async (
    context: DevboxApiContext,
    queryKey: string,
    queryName: string,
    step: string
  ) => {
    const api = createDevboxApi(context);
    const response = await api.get("/monitor/getMonitorData", {
      params: {
        queryKey,
        queryName,
        step,
      },
    });
    return response.data;
  }
);

/**
 * Check if a devbox is ready
 * @example
 * devboxName: "devbox124"
 * @returns Array with ready status and URL, or error information
 */
export const checkReady = createParallelAction(
  async (context: DevboxApiContext, devboxName: string) => {
    const api = createDevboxApi(context);
    const response = await api.get("/checkReady", {
      params: {
        devboxName,
      },
    });
    return response.data.data;
  }
);
