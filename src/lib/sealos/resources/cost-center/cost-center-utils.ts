import type { CostCenterApiContext } from "./cost-center-schemas/cost-center-api-context-schema";

export function extractRegionDomain(baseUrl?: string): string {
  if (!baseUrl) return 'usw.sealos.io';
  return baseUrl.replace(/^https?:\/\//, '').replace(/:\d+$/, '');
}

export function createCostCenterContext(
  context: Partial<CostCenterApiContext>
): CostCenterApiContext {
  const regionDomain = context.regionDomain || extractRegionDomain(context.baseUrl);
  
  return {
    baseUrl: context.baseUrl || '',
    authorization: context.authorization || '',
    workspace: context.workspace || '',
    regionDomain,
    internalToken: context.internalToken || '',
  };
}

export function validateCostCenterContext(context: CostCenterApiContext): void {
  if (!context.authorization) {
    throw new Error("Authorization token is required");
  }
}

export function validatePlanTransactionContext(context: CostCenterApiContext): void {
  if (!context.workspace || !context.regionDomain || !context.internalToken) {
    throw new Error("Missing required context: workspace, regionDomain, or internalToken");
  }
}
