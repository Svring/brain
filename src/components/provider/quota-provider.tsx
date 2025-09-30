"use client";

import React, { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthState } from "@/contexts/auth/auth-context";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useEnv } from "@/components/provider/env-provider";
import type { AiProxyFreeUsageResponse } from "@/lib/sealos/resources/ai-proxy/ai-proxy-api/ai-proxy-api-service";

interface ResourceValue {
  used: number;
  limit: number;
}

interface QuotaContextValue {
  // Resource data
  cpu: ResourceValue | null;
  memory: ResourceValue | null;
  storage: ResourceValue | null;
  ports: ResourceValue | null;
  balance: ResourceValue | null;
  aiProxy: ResourceValue | null;

  // Loading states
  isLoading: boolean;
}

const QuotaContext = createContext<QuotaContextValue | undefined>(undefined);

export function useQuota() {
  const context = useContext(QuotaContext);
  if (context === undefined) {
    throw new Error("useQuota must be used within a QuotaProvider");
  }
  return context;
}

interface QuotaProviderProps {
  children: React.ReactNode;
}

export function QuotaProvider({ children }: QuotaProviderProps) {
  const { auth } = useAuthState();
  const { k8s, aiProxy, costCenter } = useTRPCClients();
  const { MODE } = useEnv();

  // Fetch account balance using tRPC
  const { data: accountBalance, isLoading: balanceLoading } = useQuery({
    ...costCenter.accountBalance.queryOptions(),
  });

  // Fetch resource quota data
  const { data: resourceQuota, isLoading: isResourceQuotaLoading } = useQuery({
    ...k8s.resourceQuota.queryOptions(),
  });

  // Fetch AI proxy usage data - only in production mode
  const {
    data: aiProxyUsage,
    isLoading: isAiProxyLoading,
    refetch: refetchAiProxy,
  } = useQuery({
    ...aiProxy.freeUsage.queryOptions(),
    enabled: MODE === "production" && !!auth?.appToken,
    refetchInterval: 15 * 1000, // Refetch every 10 seconds
  });

  const isLoading =
    balanceLoading || isResourceQuotaLoading;

  // Transform data to simplified format
  const cpu = resourceQuota
    ? {
        used: resourceQuota.cpu.used,
        limit: resourceQuota.cpu.limit,
      }
    : null;

  const memory = resourceQuota
    ? {
        used: resourceQuota.memory.used,
        limit: resourceQuota.memory.limit,
      }
    : null;

  const storage = resourceQuota
    ? {
        used: resourceQuota.storage.used,
        limit: resourceQuota.storage.limit,
      }
    : null;

  const ports = resourceQuota
    ? {
        used: resourceQuota.ports.used,
        limit: resourceQuota.ports.limit,
      }
    : null;

  const balance = accountBalance
    ? {
        used: accountBalance.balance - accountBalance.deductionBalance,
        limit: accountBalance.balance,
      }
    : null;

  const aiProxyQuota = aiProxyUsage
    ? {
        used:
          (aiProxyUsage as AiProxyFreeUsageResponse).total_limit -
          (aiProxyUsage as AiProxyFreeUsageResponse).remaining_today,
        limit: (aiProxyUsage as AiProxyFreeUsageResponse).total_limit,
      }
    : null;

  const value: QuotaContextValue = {
    // Resource data
    cpu,
    memory,
    storage,
    ports,
    balance,
    aiProxy: aiProxyQuota,

    // Loading states
    isLoading,
  };

  return (
    <QuotaContext.Provider value={value}>{children}</QuotaContext.Provider>
  );
}
