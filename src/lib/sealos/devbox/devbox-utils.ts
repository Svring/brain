"use client";

import type { DevboxListResponse } from "./schemas";
import { DevboxApiContextSchema } from "./schemas";
import { User } from "@/payload-types";
import { nanoid } from "nanoid";
import { use } from "react";
import { AuthContext } from "@/contexts/auth-context/auth-context";

export function createDevboxContext() {
  const { user } = use(AuthContext);
  if (!user) {
    throw new Error("User not found");
  }
  return DevboxApiContextSchema.parse({
    baseURL: user.regionUrl,
    authorization: user.kubeconfig,
    authorizationBearer: user.devboxToken,
  });
}

/**
 * Transform a DevboxListResponse into an array of devbox names (string[]).
 */
export const transformDevboxListToNameList = (
  listData: DevboxListResponse | undefined
): string[] => {
  return listData?.data?.map((item) => item.name) ?? [];
};

export function generateDevboxName() {
  return `devbox-${nanoid(12)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")}`;
}
