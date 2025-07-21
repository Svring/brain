"use client";

import { useAuthState } from "@/contexts/auth/auth-context";
import { AiProxyApiContextSchema } from "./schemas/ai-proxy-api-context";

export function createAiProxyContext() {
  const { auth } = useAuthState();
  if (!auth) {
    throw new Error("User not found");
  }
  return AiProxyApiContextSchema.parse({
    baseURL: auth.regionUrl,
    authorization: auth.appToken,
  });
}
