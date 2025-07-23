"use client";

import type { DevboxListResponse } from "./schemas";
import { DevboxApiContextSchema } from "./schemas";
import { nanoid } from "nanoid";
import { useAuthState } from "@/contexts/auth/auth-context";

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

export function generateDevboxName() {
  return `devbox-${nanoid(6)}`;
}
