"use client";

import type { DevboxListResponse } from "./schemas";
import { DevboxApiContextSchema } from "./schemas";
import { User } from "@/payload-types";
import { nanoid } from "nanoid";

export function createDevboxContext(user: User) {
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
  return `devbox-${nanoid(12)}`;
}
