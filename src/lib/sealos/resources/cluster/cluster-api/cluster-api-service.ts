import { getMonitorData } from "./cluster-old-api";
import type { SealosApiContext } from "@/lib/sealos/sealos-api-context-schema";
import { runParallelAction } from "next-server-actions-parallel";

// Monitor Data Operations
export async function getClusterMonitorData(
  context: SealosApiContext,
  dbName: string,
  dbType: string,
  queryKey: string
): Promise<any> {
  return await runParallelAction(
    getMonitorData(context, dbName, dbType, queryKey)
  );
}
