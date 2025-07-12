"use client";

import { use } from "react";
import { AuthContext } from "@/contexts/auth-context/auth-context";
import { ClusterApiContextSchema } from "./schemas/cluster-api-context-schemas";
import { nanoid } from "nanoid";

export function createClusterContext() {
  const { user } = use(AuthContext);
  if (!user) {
    throw new Error("User not found");
  }
  return ClusterApiContextSchema.parse({
    baseURL: user.regionUrl,
    authorization: user.kubeconfig,
  });
}

export function generateClusterName() {
  return `cluster-${nanoid(12)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")}`;
}
