import type { CostCenterApiContext } from "../cost-center-schemas/cost-center-api-context-schema";
import type {
  AccountBalanceResponse,
  PlanTransactionResponse,
} from "../cost-center-schemas/cost-center-api-schemas";
import { getAccountBalance, getPlanTransaction } from "../cost-center-api/cost-center-api-service";
import { validateCostCenterContext, validatePlanTransactionContext } from "../cost-center-utils";


export async function queryAccountBalance(
  context: CostCenterApiContext
): Promise<AccountBalanceResponse> {
  validateCostCenterContext(context);
  return await getAccountBalance(context);
}


export async function queryPlanTransaction(
  context: CostCenterApiContext
): Promise<PlanTransactionResponse> {
  validatePlanTransactionContext(context);
  return await getPlanTransaction(context);
}
