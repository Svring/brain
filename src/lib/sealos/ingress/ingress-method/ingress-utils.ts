"use client";

import { runParallelAction } from "next-server-actions-parallel";

// Ingress API functions
import {
  checkHttps,
  checkWss,
  checkGrpcs,
} from "../ingress-api/ingress-api-utils";

import { ProtocolCheckResult } from "../ingress-api/ingress-api-schema";

/**
 * Check protocol availability by detecting the protocol from the URL.
 * Supports HTTPS, WSS, and gRPCS protocols.
 */
export const checkUrl = async (url: string): Promise<ProtocolCheckResult> => {
  const lowerUrl = url.toLowerCase();

  if (lowerUrl.startsWith("https://")) {
    return await runParallelAction(checkHttps(url));
  } else if (lowerUrl.startsWith("wss://")) {
    return await runParallelAction(checkWss(url));
  } else if (lowerUrl.startsWith("grpcs://")) {
    return await runParallelAction(checkGrpcs(url));
  } else {
    // Default to HTTPS if no protocol is specified
    return await runParallelAction(checkHttps(url));
  }
};
