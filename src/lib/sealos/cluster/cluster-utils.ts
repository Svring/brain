"use client";

import { ClusterApiContextSchema } from "./schemas/cluster-api-context-schemas";
import { nanoid } from "nanoid";
import { useAuthContext } from "@/contexts/auth-context";

export function createClusterContext() {
  const { auth } = useAuthContext();
  if (!auth) {
    throw new Error("User not found");
  }
  return ClusterApiContextSchema.parse({
    baseURL: auth?.regionUrl,
    authorization: auth?.kubeconfig,
  });
}

export function generateClusterName() {
  return `cluster-${nanoid(12)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")}`;
}
