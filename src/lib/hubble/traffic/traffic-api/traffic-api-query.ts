"use server";

import axios from "axios";
import { createParallelAction } from "next-server-actions-parallel";
import { TrafficApiContext } from "../schemas/traffic-api-context-schema";
import {
  GetPodTrafficRequestSchema,
  GetPodTrafficResponseSchema,
  GetPodTrafficRequest,
  GetPodTrafficResponse,
} from "../schemas/traffic-flow-schema";
import https from "https";

function createTrafficApi(context: TrafficApiContext) {
  const isDevelopment = process.env.NEXT_PUBLIC_MODE === "development";

  // In development, try HTTP first, then HTTPS if needed
  const protocol = isDevelopment ? "http" : "https";

  return axios.create({
    baseURL: `${protocol}://${context.baseURL}`,
    headers: {
      "Content-Type": "application/json",
      ...(context.kubeconfig ? { Authorization: `${context.kubeconfig}` } : {}),
    },
    httpsAgent: isDevelopment
      ? new https.Agent({
          rejectUnauthorized: false,
          secureProtocol: "TLSv1_2_method",
        })
      : undefined,
    timeout: 10000, // 10 second timeout
  });
}

export const getPodTraffic = createParallelAction(
  async (
    request: GetPodTrafficRequest,
    context: TrafficApiContext
  ): Promise<GetPodTrafficResponse> => {
    try {
      const validatedRequest = GetPodTrafficRequestSchema.parse(request);
      const api = createTrafficApi(context);
      const response = await api.post("/api/v1/flows", validatedRequest);
      console.log("response", response);
      return GetPodTrafficResponseSchema.parse(response.data);
    } catch (error) {
      console.error("Error in getPodTraffic:", JSON.stringify(error));
      throw error; // Re-throw to maintain error handling chain
    }
  }
);
