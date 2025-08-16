"use server";

import axios from "axios";
import { createParallelAction } from "next-server-actions-parallel";
import { MetricsApiContext } from "../schemas/metrics-api-context-schema";
import {
  GetClusterMetricsRequestSchema,
  GetClusterMetricsResponseSchema,
  GetClusterMetricsRequest,
  GetClusterMetricsResponse,
} from "../schemas/cluster-metrics-schema";
import https from "https";

function createClusterMetricsApi(context: MetricsApiContext) {
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

export const getClusterMetrics = createParallelAction(
  async (
    request: GetClusterMetricsRequest,
    context: MetricsApiContext
  ): Promise<GetClusterMetricsResponse> => {
    const validatedRequest = GetClusterMetricsRequestSchema.parse(request);
    const api = createClusterMetricsApi(context);

    // Convert the request to form data format as specified in the interface
    const formData = new URLSearchParams();
    formData.append("namespace", validatedRequest.namespace);
    formData.append("app", validatedRequest.app);

    // Add either custom query or predefined type
    if (validatedRequest.query) {
      formData.append("query", validatedRequest.query);
    }
    if (validatedRequest.type) {
      formData.append("type", validatedRequest.type);
    }

    // Add time parameters
    if (validatedRequest.time) {
      formData.append("time", validatedRequest.time);
    }
    if (validatedRequest.start) {
      formData.append("start", validatedRequest.start);
    }
    if (validatedRequest.end) {
      formData.append("end", validatedRequest.end);
    }
    if (validatedRequest.step) {
      formData.append("step", validatedRequest.step);
    }

    // Log the complete request body before making the request
    // Convert formData to a plain object for easier logging
    const formDataObj: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      formDataObj[key] = value;
    }
    console.log("[getClusterMetrics] Request body:", formDataObj);

    const response = await api.post("/q", formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    return GetClusterMetricsResponseSchema.parse(response.data);
  }
);
