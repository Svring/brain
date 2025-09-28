import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { openCostCenterApp } from "@/lib/auth/auth-utils";
import React from "react";

interface ResourceRequirements {
  cpu?: number;
  memory?: number;
  storage?: number;
  ports?: number;
}

interface QuotaCheckResult {
  passed: boolean;
  exceededResources: Array<{
    resource: "cpu" | "memory" | "storage" | "ports";
    required: number;
    available: number;
    message: string;
  }>;
}

export function useResourceQuotaChecker() {
  const { k8s } = useTRPCClients();

  const { data: quota, isLoading } = useQuery({
    ...k8s.resourceQuota.queryOptions(),
    staleTime: 5 * 1000,
  });

  const checkResourceQuota = (
    requirements: ResourceRequirements
  ): QuotaCheckResult => {
    if (!quota) {
      return { passed: true, exceededResources: [] };
    }

    const exceededResources: QuotaCheckResult["exceededResources"] = [];

    if (requirements.cpu && quota.cpu) {
      const availableCpu = quota.cpu.limit - quota.cpu.used;
      if (requirements.cpu > availableCpu) {
        exceededResources.push({
          resource: "cpu",
          required: requirements.cpu,
          available: availableCpu,
          message: `CPU: requires ${
            requirements.cpu
          } cores, ${availableCpu.toFixed(2)} cores available`,
        });
      }
    }

    if (requirements.memory && quota.memory) {
      const availableMemory = quota.memory.limit - quota.memory.used;
      if (requirements.memory > availableMemory) {
        exceededResources.push({
          resource: "memory",
          required: requirements.memory,
          available: availableMemory,
          message: `Memory: requires ${
            requirements.memory
          }GB, ${availableMemory.toFixed(2)}GB available`,
        });
      }
    }

    if (requirements.storage && quota.storage) {
      const availableStorage = quota.storage.limit - quota.storage.used;
      if (requirements.storage > availableStorage) {
        exceededResources.push({
          resource: "storage",
          required: requirements.storage,
          available: availableStorage,
          message: `Storage: requires ${
            requirements.storage
          }GB, ${availableStorage.toFixed(2)}GB available`,
        });
      }
    }

    if (requirements.ports && quota.ports) {
      const availablePorts = quota.ports.limit - quota.ports.used;
      if (requirements.ports > availablePorts) {
        exceededResources.push({
          resource: "ports",
          required: requirements.ports,
          available: availablePorts,
          message: `Ports: requires ${
            requirements.ports
          } ports, ${availablePorts.toFixed(2)} ports available`,
        });
      }
    }

    return {
      passed: exceededResources.length === 0,
      exceededResources,
    };
  };

  const checkAndShowQuotaError = (
    requirements: ResourceRequirements
  ): boolean => {
    const result = checkResourceQuota(requirements);

    if (!result.passed) {
      toast("", {
        description: React.createElement(
          "div",
          {
            className: "flex flex-col space-y-2 w-full min-w-max",
          },
          React.createElement(
            "p",
            {
              className: "text-md font-semibold text-theme-red",
            },
            "Insufficient Quotas"
          ),
          React.createElement(
            "div",
            {
              className: "text-sm space-y-1",
            },
            result.exceededResources.map((e, index) =>
              React.createElement(
                "div",
                {
                  key: index,
                  className: "flex items-center gap-2 whitespace-nowrap",
                },
                React.createElement("span", {
                  dangerouslySetInnerHTML: {
                    __html: e.message.replace(
                      /(\d+(?:\.\d+)?)/g,
                      '<span class="text-foreground font-semibold">$1</span>'
                    ),
                  },
                })
              )
            )
          ),
          React.createElement(
            "button",
            {
              onClick: openCostCenterApp,
              className:
                "w-full py-1.5 bg-foreground text-sm text-background rounded-md hover:opacity-90 transition-opacity whitespace-nowrap",
              variant: "outline",
            },
            "Open Cost Center"
          )
        ),
        duration: 8000,
        style: {
          width: "auto",
          minWidth: "max-content",
        },
      });
      return false;
    }

    return true;
  };

  return {
    checkResourceQuota,
    checkAndShowQuotaError,
    isLoading,
    quota,
  };
}
