"use server";

import axios from "axios";
import { createParallelAction } from "next-server-actions-parallel";
import https from "https";
import { SealosApiContext } from "@/lib/sealos/sealos-api-context-schema";
import { AppControlSuccessResponse } from "./launchpad-open-api-schemas/launchpad-control-schema";

function createLaunchpadApi(context: SealosApiContext) {
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

export const startLaunchpad = createParallelAction(
  async (context: SealosApiContext, name: string) => {
    const api = createLaunchpadApi(context);
    const response = await api.get<AppControlSuccessResponse>("/app/start", {
      params: { name },
    });
    return response.data;
  }
);

export const pauseLaunchpad = createParallelAction(
  async (context: SealosApiContext, name: string) => {
    const api = createLaunchpadApi(context);
    const response = await api.get<AppControlSuccessResponse>("/app/pause", {
      params: { name },
    });
    return response.data;
  }
);
