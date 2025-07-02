"use server";

import { headers } from "next/headers";
import { getPayload } from "payload";

import config from "@/payload.config";
import type { User } from "@/payload-types";

// Get the currently authenticated user
export async function getUser(): Promise<User | null> {
  const headersList = await headers();
  const payloadConfig = await config;
  const payload = await getPayload({ config: payloadConfig });
  const { user } = await payload.auth({ headers: headersList });
  return user;
}
