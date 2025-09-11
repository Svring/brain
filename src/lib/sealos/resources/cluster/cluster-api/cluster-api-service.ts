import { getMonitorData } from "./cluster-old-api";
import type { SealosApiContext } from "@/lib/sealos/sealos-api-context-schema";
import { runParallelAction } from "next-server-actions-parallel";
import axios from "axios";
import https from "https";

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

// Helper to create axios instance per request
function createClusterApi(context: SealosApiContext) {
  const isDevelopment = process.env.NEXT_PUBLIC_MODE === "development";
  return axios.create({
    baseURL: `http://dbprovider.${context.baseUrl}/api/database`,
    headers: {
      "Content-Type": "application/json",
      ...(context.authorization
        ? { Authorization: context.authorization }
        : {}),
    },
    httpsAgent: isDevelopment
      ? new https.Agent({ rejectUnauthorized: false })
      : undefined,
  });
}

// Backup Operations
export async function deleteClusterBackup(
  context: SealosApiContext,
  clusterName: string,
  backupName: string
): Promise<any> {
  const api = createClusterApi(context);
  const response = await api.delete(`/${clusterName}/backup/${backupName}`);
  return response.data;
}
