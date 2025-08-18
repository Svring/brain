import { getMonitorData } from "./launchpad-old-api";
import { checkReadyLaunchpad } from "./launchpad-old-api";
import type { SealosApiContext } from "@/lib/sealos/sealos-api-context-schema";
import { runParallelAction } from "next-server-actions-parallel";
import type { LaunchpadCheckReadyRequest } from "./launchpad-old-api-schemas/req-res-check-ready-schemas";

// Monitor Data Operations
export async function getLaunchpadMonitorData(
  context: SealosApiContext,
  queryKey: string,
  queryName: string,
  step: string
): Promise<any> {
  return await runParallelAction(
    getMonitorData(context, queryKey, queryName, step)
  );
}

// Check Ready Operations
export async function checkLaunchpadReady(
  request: LaunchpadCheckReadyRequest,
  context: SealosApiContext
): Promise<any> {
  return await runParallelAction(checkReadyLaunchpad(request, context));
}
