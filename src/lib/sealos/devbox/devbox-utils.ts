"use client";

import { DevboxApiContextSchema } from "./devbox-schemas/devbox-api-context-schema";
import { nanoid } from "nanoid";
import { useAuthState } from "@/contexts/auth/auth-context";
import {
  DevboxResourceK8s,
  DevboxSecret,
  DevboxPod,
  DevboxIngress,
} from "@/lib/sealos/devbox/devbox-api/devbox-open-api-schemas/devbox-k8s-schemas";
import { DevboxNodeData } from "@/lib/sealos/devbox/devbox-api/devbox-open-api-schemas/devbox-node-schemas";
import _ from "lodash";

export function createDevboxContext() {
  const { auth } = useAuthState();
  if (!auth) {
    throw new Error("User not found");
  }
  return DevboxApiContextSchema.parse({
    baseURL: auth.regionUrl,
    authorization: auth.kubeconfig,
    authorizationBearer: auth.appToken,
  });
}

// Extract name from Kubernetes Devbox resource
