import { z } from "zod";

export const AccountBalanceSchema = z.object({
  balance: z.number(),
  deductionBalance: z.number(),
});

export const AccountBalanceRequestSchema = z.object({
  workspace: z.string(),
  regionDomain: z.string(),
  internalToken: z.string(),
});

export const AccountBalanceResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
  data: AccountBalanceSchema.nullable(),
});

export const PlanTransactionSchema = z.object({
  ID: z.string(),
  From: z.string(),
  Workspace: z.string(),
  RegionDomain: z.string(),
  UserUID: z.string(),
  OldPlanName: z.string(),
  NewPlanName: z.string(),
  OldPlanStatus: z.string(),
  Operator: z.string(),
  StartAt: z.string(),
  CreatedAt: z.string(),
  UpdatedAt: z.string(),
  Status: z.string(),
  StatusDesc: z.string(),
  PayStatus: z.string(),
  PayID: z.string(),
  Period: z.string(),
  Amount: z.number(),
});

export const PlanTransactionRequestSchema = z.object({
  workspace: z.string(),
  regionDomain: z.string(),
  internalToken: z.string(),
});

export const PlanTransactionResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
  data: z.object({
    transaction: PlanTransactionSchema,
  }).nullable(),
});


export type AccountBalance = z.infer<typeof AccountBalanceSchema>;
export type AccountBalanceRequest = z.infer<typeof AccountBalanceRequestSchema>;
export type AccountBalanceResponse = z.infer<typeof AccountBalanceResponseSchema>;
export type PlanTransaction = z.infer<typeof PlanTransactionSchema>;
export type PlanTransactionRequest = z.infer<typeof PlanTransactionRequestSchema>;
export type PlanTransactionResponse = z.infer<typeof PlanTransactionResponseSchema>;
