import { initTRPC } from "@trpc/server";
import { z } from "zod";
import type { CostCenterContext } from "./cost-center-trpc-context";

import {
  getPlanTransaction,
  getAccountBalance,
} from "@/lib/sealos/resources/cost-center/cost-center-api/cost-center-old-api";

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

  accountBalance: t.procedure.query(async ({ ctx }) => {
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

    return result.data || {};
  }),
});

export type CostCenterRouter = typeof costCenterRouter;
