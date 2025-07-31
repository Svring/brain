"use client";

import { TrafficApiContextSchema } from "./schemas/traffic-api-context-schema";
import { useAuthState } from "@/contexts/auth/auth-context";
import {
  TRAFFIC_URL,
  TRAFFIC_TEST_URL,
} from "./traffic-constant/traffic-constant-url";

export function createTrafficApiContext() {
  const { auth } = useAuthState();
  const isDevelopment = process.env.NEXT_PUBLIC_MODE === "development";
  if (!auth) {
    throw new Error("Auth context is not available");
  }
  return TrafficApiContextSchema.parse({
    baseURL: isDevelopment ? TRAFFIC_TEST_URL : TRAFFIC_URL,
    kubeconfig: auth.kubeconfig,
  });
}
