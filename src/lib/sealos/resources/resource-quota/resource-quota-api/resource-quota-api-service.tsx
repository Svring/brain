import type { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import type { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import {
  listBuiltinResources,
  getBuiltinResource,
} from "@/lib/k8s/k8s-api/k8s-api-query";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { BuiltinResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import {
  convertResourceQuotaListToSimplified,
  convertResourceQuotaToSummary,
} from "../resource-quota-method/resource-quota-utils";
import { convertResourceQuotaToUniversalUnits } from "@/lib/k8s/k8s-method/k8s-utils";
import { runParallelAction } from "next-server-actions-parallel";

// ===== QUERY OPERATIONS =====

// ResourceQuota Listing & Information
export async function listResourceQuotas(context: K8sApiContext) {
  const target = BuiltinResourceTargetSchema.parse(
    convertResourceTypeToTarget("resourcequota")
  );
  const resourceQuotaResourceList = await runParallelAction(
    listBuiltinResources(context, target)
  );
  return convertResourceQuotaListToSimplified(resourceQuotaResourceList.items);
}

export async function getResourceQuotaByName(
  context: K8sApiContext,
  target: BuiltinResourceTarget
) {
  return await runParallelAction(getBuiltinResource(context, target));
}

export async function getResourceQuota(context: K8sApiContext) {
  // First, get the list of resource quotas
  const resourceQuotas = await listResourceQuotas(context);

  if (resourceQuotas.length === 0) {
    throw new Error("No resource quotas found");
  }

  // Get the first resource quota's name
  const firstResourceQuotaName = resourceQuotas[0].name;

  if (!firstResourceQuotaName) {
    throw new Error("First resource quota has no name");
  }

  // Create target for the specific resource quota
  const target = BuiltinResourceTargetSchema.parse(
    convertResourceTypeToTarget("resourcequota", firstResourceQuotaName)
  );

  // Get the full resource quota details
  const resourceQuota = await getResourceQuotaByName(context, target);

  // Convert to structured summary and log
  const quotaSummary = convertResourceQuotaToSummary(resourceQuota);
  
  return quotaSummary;
}
