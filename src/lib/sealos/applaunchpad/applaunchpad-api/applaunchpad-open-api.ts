"use server";

import axios from "axios";
import { createParallelAction } from "next-server-actions-parallel";
import https from "https";
import { SealosApiContext } from "@/lib/sealos/sealos-api-context-schema";
import { AppControlSuccessResponse } from "./applaunchpad-api-schemas/app-control-schema";

function createApplaunchpadApi(context: SealosApiContext) {
  const isDevelopment = process.env.NEXT_PUBLIC_MODE === "development";
  return axios.create({
    baseURL: isDevelopment
      ? `http://applaunchpad.${context.baseURL}/api/v1`
      : `https://applaunchpad.${context.baseURL}/api/v1`,
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

export const startApp = createParallelAction(
  async (context: SealosApiContext, appName: string) => {
    const api = createApplaunchpadApi(context);
    const response = await api.get<AppControlSuccessResponse>("/app/startApp", {
      params: { appName },
    });
    return response.data;
  }
);

export const pauseApp = createParallelAction(
  async (context: SealosApiContext, appName: string) => {
    const api = createApplaunchpadApi(context);
    const response = await api.get<AppControlSuccessResponse>("/app/pauseApp", {
      params: { appName },
    });
    return response.data;
  }
);
