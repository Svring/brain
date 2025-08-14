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

  // In development, try HTTP first, then HTTPS if needed
  const protocol = isDevelopment ? "http" : "https";

  return axios.create({
    baseURL: context.baseURL,
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

    const response = await api.post(LAUNCHPAD_METRICS_URL, formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    return GetLaunchPadMetricsResponseSchema.parse(response.data);
  }
);
