import { initTRPC } from "@trpc/server";
import { z } from "zod";
import type { CostCenterContext } from "./cost-center-trpc-context";

import {
  getPlanTransaction,
  getAccountBalance,
} from "@/lib/sealos/resources/cost-center/cost-center-api/cost-center-old-api";

// ===== SCHEMAS =====

// Account Balance Response Schema
const AccountBalanceResponseSchema = z.object({
  balance: z.number(),
  deductionBalance: z.number(),
  currency: z.string().optional(),
  status: z.string().optional(),
});

const t = initTRPC.context<CostCenterContext>().create();

export const costCenterRouter = t.router({
  planTransaction: t.procedure.query(async ({ ctx }) => {
    const context = {
      baseUrl: ctx.regionUrl,
      regionDomain: ctx.regionDomain,
      workspace: ctx.namespace,
      namespace: ctx.namespace,
      kubeconfig: ctx.kubeconfig,
      authorization: ctx.authorization,
      internalToken: ctx.internalToken || undefined,
    };

    const result = await getPlanTransaction(context);

    if (result.code !== 200) {
      throw new Error(`Plan transaction API error: ${result.message}`);
    }

    return result.data || {};
  }),

  accountBalance: t.procedure
    .output(AccountBalanceResponseSchema)
    .query(async ({ ctx }) => {
      const context = {
        baseUrl: ctx.regionUrl,
        regionDomain: ctx.regionDomain,
        workspace: ctx.namespace,
        namespace: ctx.namespace,
        kubeconfig: ctx.kubeconfig,
        authorization: ctx.authorization,
        internalToken: ctx.internalToken || undefined, // 使用正确的 internalToken
      };

      const result = await getAccountBalance(context);

      // 处理业务错误码
      if (result.code !== 200) {
        throw new Error(`Account balance API error: ${result.message}`);
      }

      // Ensure we return the expected structure
      const data = (result.data || {}) as {
        balance?: number;
        deductionBalance?: number;
        currency?: string;
        status?: string;
      };
      return {
        balance: data.balance || 0,
        deductionBalance: data.deductionBalance || 0,
        currency: data.currency,
        status: data.status,
      };
    }),
});

export type CostCenterRouter = typeof costCenterRouter;
