import { getMonitorData } from "./launchpad-old-api";
import type { SealosApiContext } from "@/lib/sealos/sealos-api-context-schema";
import { runParallelAction } from "next-server-actions-parallel";

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
