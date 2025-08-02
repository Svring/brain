import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { SealosApiContext } from "../../sealos-api-context-schema";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { getDeployment } from "../../deployment/deployment-method/deployment-query";
import { getStatefulSet } from "../../statefulset/statefulset-method/statefulset-query";
import { queryLogs } from "../app-api/app-old-api";
import {
  QueryLogsRequest,
  QueryLogsRequestSchema,
  QueryLogsResponseSchema,
} from "../app-api/app-old-api-schemas/req-res-query-logs-schemas";
import { runParallelAction } from "next-server-actions-parallel";

export const getApp = async (
  context: K8sApiContext,
  target: BuiltinResourceTarget
) => {
  switch (target.resourceType) {
    case "deployment":
      return await getDeployment(context, target);
    case "statefulset":
      return await getStatefulSet(context, target);
    default:
      throw new Error(
        `Resource type ${target.resourceType} is not supported for app queries`
      );
  }
};

export const queryAppLogs = async (
  k8sContext: K8sApiContext,
  sealosContext: SealosApiContext,
  target: BuiltinResourceTarget
) => {
  // Construct the request with default values based on the example
  const logRequest: QueryLogsRequest = {
    app: target.name!,
    numberMode: "true",
    numberLevel: "m",
    jsonMode: "false",
    time: "30m",
    stderrMode: "false",
    pod: [],
    container: [],
    jsonQuery: [],
    keyword: "",
    namespace: k8sContext.namespace,
    limit: "10", // Default limit
  };

  // Validate the request
  const validatedRequest = QueryLogsRequestSchema.parse(logRequest);

  // Query the logs
  const logResponse = await runParallelAction(
    queryLogs(validatedRequest, sealosContext)
  );
  console.log("queryAppLogs logResponse", logResponse);
  // Validate and return the response
  return QueryLogsResponseSchema.parse(logResponse);
};
