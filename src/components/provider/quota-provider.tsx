"use client";

import { useQuery } from "@tanstack/react-query";
import { createContext, useContext } from "react";
import { useAuthState } from "@/contexts/auth/auth-context";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";

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
  const { k8s, aiProxy } = useTRPCClients();

  const { data: aiProxyTokens } = useQuery({
    ...aiProxy.list.queryOptions("ai-proxy"),
    enabled: !!auth?.appToken,
  });

  const brainToken = aiProxyTokens?.tokens?.find(
    (token: { name: string; key: string }) => token.name === "brain"
  );

  const apiKey = brainToken ? `sk-${brainToken.key}` : undefined;

  const { data: billingQuota, isLoading: balanceLoading } = useQuery({
    ...aiProxy.billingQuota.queryOptions({ apiToken: apiKey || "" }),
    enabled: !!apiKey,
  });

  // Fetch resource quota data
  const { data: resourceQuota, isLoading: isResourceQuotaLoading } = useQuery({
    ...k8s.resourceQuota.queryOptions(),
  });

  const isLoading = balanceLoading || isResourceQuotaLoading;

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

  const balance = billingQuota
    ? {
        used: billingQuota.remain,
        limit: billingQuota.total,
      }
    : null;

  const value: QuotaContextValue = {
    // Resource data
    cpu,
    memory,
    storage,
    ports,
    balance,

    // Loading states
    isLoading,
  };

  return (
    <QuotaContext.Provider value={value}>{children}</QuotaContext.Provider>
  );
}
