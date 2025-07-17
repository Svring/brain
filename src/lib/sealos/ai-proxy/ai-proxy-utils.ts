"use client";

import { useAuthContext } from "@/contexts/auth-context/auth-context";
import { AiProxyApiContextSchema } from "./schemas/ai-proxy-api-context";

export function createAiProxyContext() {
  const { auth } = useAuthContext();
  if (!auth) {
    throw new Error("User not found");
  }
  return AiProxyApiContextSchema.parse({
    baseURL: auth.regionUrl,
    authorization: auth.appToken,
  });
}
