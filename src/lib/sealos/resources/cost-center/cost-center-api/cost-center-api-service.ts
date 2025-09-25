import type { CostCenterApiContext } from "../cost-center-schemas/cost-center-api-context-schema";
import type {
  AccountBalanceResponse,
  PlanTransactionResponse,
} from "../cost-center-schemas/cost-center-api-schemas";
import {
  getAccountBalance as getAccountBalanceOld,
  getPlanTransaction as getPlanTransactionOld,
} from "./cost-center-old-api";


export async function getAccountBalance(
  context: CostCenterApiContext
): Promise<AccountBalanceResponse> {
  return await getAccountBalanceOld(context);
}

export async function getPlanTransaction(
  context: CostCenterApiContext
): Promise<PlanTransactionResponse> {
  return await getPlanTransactionOld(context);
}
