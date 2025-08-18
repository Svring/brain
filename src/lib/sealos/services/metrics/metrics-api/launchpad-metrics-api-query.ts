"use server";

import axios from "axios";
import { createParallelAction } from "next-server-actions-parallel";
import { MetricsApiContext } from "../schemas/metrics-api-context-schema";
import {
  GetLaunchPadMetricsRequestSchema,
  GetLaunchPadMetricsResponseSchema,
  GetLaunchPadMetricsRequest,
  GetLaunchPadMetricsResponse,
} from "../schemas/metrics-query-schema";
import {
  LAUNCHPAD_METRICS_URL,
  LAUNCHPAD_METRICS_TEST_URL,
} from "../metrics-constant/metrics-constant-url";
import https from "https";

function createLaunchPadMetricsApi(context: MetricsApiContext) {
  const isDevelopment = process.env.NEXT_PUBLIC_MODE === "development";

  const protocol = isDevelopment ? "http" : "https";

  return axios.create({
    baseURL: `${protocol}://${context.baseURL}`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      ...(context.kubeconfig ? { Authorization: `${context.kubeconfig}` } : {}),
    },
    httpsAgent: isDevelopment
      ? new https.Agent({
          rejectUnauthorized: false,
        })
      : undefined,
    timeout: 10000, // 10 second timeout
  });
}

export const getLaunchPadMetrics = createParallelAction(
  async (
    request: GetLaunchPadMetricsRequest,
    context: MetricsApiContext
  ): Promise<GetLaunchPadMetricsResponse> => {
    const validatedRequest = GetLaunchPadMetricsRequestSchema.parse(request);
    const api = createLaunchPadMetricsApi(context);

    // Convert the request to form data format as specified in the interface
    const formData = new URLSearchParams();
    formData.append("namespace", validatedRequest.namespace);
    formData.append("type", validatedRequest.type);
    formData.append("launchPadName", validatedRequest.launchPadName);

    if (validatedRequest.start)
      formData.append("start", validatedRequest.start);
    if (validatedRequest.end) formData.append("end", validatedRequest.end);
    if (validatedRequest.step) formData.append("step", validatedRequest.step);
    if (validatedRequest.time) formData.append("time", validatedRequest.time);

    // console.log("formData", formData);

    const response = await api.post("/query", formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    try {
      return GetLaunchPadMetricsResponseSchema.parse(response.data);
    } catch (error) {
      console.error("Schema validation failed:", error);
      console.error("Response data:", JSON.stringify(response.data, null, 2));
      throw error;
    }
  }
);
