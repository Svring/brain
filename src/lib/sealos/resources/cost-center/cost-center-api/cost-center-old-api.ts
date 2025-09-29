import axios from "axios";
import https from "https";
import type { CostCenterApiContext } from "../cost-center-schemas/cost-center-api-context-schema";
import type {
  AccountBalanceRequest,
  AccountBalanceResponse,
  PlanTransactionRequest,
  PlanTransactionResponse,
} from "../cost-center-schemas/cost-center-api-schemas";
import {
  AccountBalanceRequestSchema,
  AccountBalanceResponseSchema,
  PlanTransactionRequestSchema,
  PlanTransactionResponseSchema,
} from "../cost-center-schemas/cost-center-api-schemas";

function createCostCenterApi(context: CostCenterApiContext) {
  const isDevelopment = process.env.NEXT_PUBLIC_MODE === "development";

  const regionDomain =
    context.regionDomain ||
    (context.baseUrl
      ? context.baseUrl.replace(/^https?:\/\//, "").replace(/:\d+$/, "")
      : (() => {
          throw new Error("regionDomain is required");
        })());

  return axios.create({
    baseURL: `https://costcenter.${regionDomain}`,
    headers: {
      "Content-Type": "application/json",
      // 使用 kubeconfig 作为 Authorization header，不是 Bearer token
      ...(context.authorization
        ? { Authorization: context.authorization }
        : {}),
    },
    httpsAgent: isDevelopment
      ? new https.Agent({ rejectUnauthorized: false })
      : undefined,
  });
}

function createAccountApi(context: CostCenterApiContext) {
  const isDevelopment = process.env.MODE === "development";

  const regionDomain =
    context.regionDomain ||
    (context.baseUrl
      ? context.baseUrl.replace(/^https?:\/\//, "").replace(/:\d+$/, "")
      : (() => {
          throw new Error("regionDomain is required");
        })());

  // 修复：Account API 应该使用 costcenter 子域名
  const baseURL = `https://costcenter.${regionDomain}`;

  return axios.create({
    baseURL: baseURL,
    headers: {
      "Content-Type": "application/json",
      // Account API 使用 kubeconfig 作为 Authorization
      ...(context.kubeconfig ? { Authorization: context.kubeconfig } : {}),
    },
    httpsAgent: isDevelopment
      ? new https.Agent({ rejectUnauthorized: false })
      : undefined,
  });
}

export async function getAccountBalance(
  context: CostCenterApiContext
): Promise<AccountBalanceResponse> {
  const regionDomain =
    context.regionDomain ||
    (context.baseUrl
      ? context.baseUrl.replace(/^https?:\/\//, "").replace(/:\d+$/, "")
      : (() => {
          throw new Error("regionDomain is required");
        })());

  // 修复：Account API 应该使用 costcenter 子域名
  const requestUrl = `https://costcenter.${regionDomain}/api/account/getAmount`;

  if (!context.kubeconfig) {
    throw new Error("Kubeconfig is required for account balance API");
  }

  const api = createAccountApi(context);

  // Create request body similar to plan transaction
  const requestData: AccountBalanceRequest = {
    workspace:
      context.workspace ||
      context.namespace ||
      (() => {
        throw new Error("workspace/namespace is required");
      })(),
    regionDomain: regionDomain,
    internalToken: context.internalToken || context.kubeconfig, // 使用 internalToken，fallback 到 kubeconfig
  };

  // console.log("requestData", requestData);

  // Validate request data
  AccountBalanceRequestSchema.parse(requestData);

  try {
    const response = await api.post("/api/account/getAmount", requestData);
    // console.log("response", response.data);
    const validatedResponse = AccountBalanceResponseSchema.parse(response.data);
    return validatedResponse;
  } catch (error: any) {
    throw error;
  }
}

export async function getPlanTransaction(
  context: CostCenterApiContext
): Promise<PlanTransactionResponse> {
  const regionDomain =
    context.regionDomain ||
    (context.baseUrl
      ? context.baseUrl.replace(/^https?:\/\//, "").replace(/:\d+$/, "")
      : (() => {
          throw new Error("regionDomain is required");
        })());

  const workspace =
    context.workspace ||
    context.namespace ||
    (() => {
      throw new Error("workspace/namespace is required");
    })();
  const internalToken =
    context.internalToken || context.kubeconfig || context.authorization; // Use internalToken as primary

  if (!workspace || !regionDomain || !internalToken) {
    throw new Error(
      "Missing required context: workspace, regionDomain, or internalToken"
    );
  }

  const requestData: PlanTransactionRequest = {
    workspace: workspace,
    regionDomain: regionDomain,
    internalToken: internalToken,
  };

  PlanTransactionRequestSchema.parse(requestData);

  const api = createCostCenterApi({
    ...context,
    authorization: context.kubeconfig,
  });

  try {
    const response = await api.post("/api/plan/transaction", requestData);
    const validatedResponse = PlanTransactionResponseSchema.parse(
      response.data
    );

    return validatedResponse;
  } catch (error: any) {
    throw error;
  }
}
