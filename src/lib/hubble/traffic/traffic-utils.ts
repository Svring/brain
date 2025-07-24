"use client";

import { TrafficApiContextSchema } from "./schemas/traffic-api-context-schema";
import { Auth } from "@/contexts/auth/auth-machine";

export function createTrafficContext(auth: Auth) {
  return TrafficApiContextSchema.parse({
    baseURL: "http://localhost:8428",
    kubeconfig: auth.kubeconfig,
    namespace: auth.namespace,
  });
}
