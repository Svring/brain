import type { CostCenterApiContext } from "../cost-center-schemas/cost-center-api-context-schema";
import { extractRegionDomain, createCostCenterContext } from "../cost-center-utils";

export function formatAccountBalance(balance: number): string {
  return balance.toFixed(2);
}

export function formatTransactionAmount(amount: number): string {
  return amount.toFixed(2);
}

export function hasSufficientBalance(balance: number, required: number): boolean {
  return balance >= required;
}

export function createContextFromAuth(auth: {
  kubeconfig: string;
  namespace: string;
  regionUrl: string;
  appToken?: string;
}): CostCenterApiContext {
  const regionDomain = extractRegionDomain(auth.regionUrl);
  
  return createCostCenterContext({
    baseUrl: auth.regionUrl,
    authorization: auth.kubeconfig,
    workspace: auth.namespace,
    regionDomain,
    internalToken: auth.appToken,
  });
}
