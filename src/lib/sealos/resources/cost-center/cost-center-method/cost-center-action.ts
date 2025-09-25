import type { CostCenterApiContext } from "../cost-center-schemas/cost-center-api-context-schema";
import type {
  AccountBalanceResponse,
  PlanTransactionResponse,
} from "../cost-center-schemas/cost-center-api-schemas";
import { queryAccountBalance, queryPlanTransaction } from "./cost-center-query";
import { COST_CENTER_ERRORS } from "../cost-center-constant/cost-center-constant";

export async function fetchAccountBalanceAction(
  context: CostCenterApiContext
): Promise<AccountBalanceResponse> {
  try {
    return await queryAccountBalance(context);
  } catch (error: any) {
    console.error("Failed to fetch account balance:", error);
    throw new Error(`${COST_CENTER_ERRORS.API_ERROR}: ${error.message}`);
  }
}

export async function fetchPlanTransactionAction(
  context: CostCenterApiContext
): Promise<PlanTransactionResponse> {
  try {
    return await queryPlanTransaction(context);
  } catch (error: any) {
    console.error("Failed to fetch plan transaction:", error);
    throw new Error(`${COST_CENTER_ERRORS.API_ERROR}: ${error.message}`);
  }
}

export async function refreshCostCenterDataAction(
  context: CostCenterApiContext
): Promise<{
  accountBalance: AccountBalanceResponse;
  planTransaction: PlanTransactionResponse;
}> {
  try {
    const [accountBalance, planTransaction] = await Promise.all([
      queryAccountBalance(context),
      queryPlanTransaction(context),
    ]);

    return {
      accountBalance,
      planTransaction,
    };
  } catch (error: any) {
    console.error("Failed to refresh cost center data:", error);
    throw new Error(`${COST_CENTER_ERRORS.API_ERROR}: ${error.message}`);
  }
}
