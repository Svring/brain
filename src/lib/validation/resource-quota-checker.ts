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
    resource: 'cpu' | 'memory' | 'storage' | 'ports';
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
    
    const exceededResources: QuotaCheckResult['exceededResources'] = [];
    
    if (requirements.cpu && quota.cpu) {
      const availableCpu = quota.cpu.limit - quota.cpu.used;
      if (requirements.cpu > availableCpu) {
        exceededResources.push({
          resource: 'cpu',
          required: requirements.cpu,
          available: availableCpu,
          message: `Insufficient CPU: requires ${requirements.cpu} cores, ${availableCpu.toFixed(2)} cores available`
        });
      }
    }
    
    if (requirements.memory && quota.memory) {
      const availableMemory = quota.memory.limit - quota.memory.used;
      if (requirements.memory > availableMemory) {
        exceededResources.push({
          resource: 'memory',
          required: requirements.memory,
          available: availableMemory,
          message: `Insufficient Memory: requires ${requirements.memory}GB, ${availableMemory.toFixed(2)}GB available`
        });
      }
    }
    
    if (requirements.storage && quota.storage) {
      const availableStorage = quota.storage.limit - quota.storage.used;
      if (requirements.storage > availableStorage) {
        exceededResources.push({
          resource: 'storage',
          required: requirements.storage,
          available: availableStorage,
          message: `Insufficient Storage: requires ${requirements.storage}GB, ${availableStorage.toFixed(2)}GB available`
        });
      }
    }
    
    if (requirements.ports && quota.ports) {
      const availablePorts = quota.ports.limit - quota.ports.used;
      if (requirements.ports > availablePorts) {
        exceededResources.push({
          resource: 'ports',
          required: requirements.ports,
          available: availablePorts,
          message: `Insufficient Ports: requires ${requirements.ports} ports, ${availablePorts.toFixed(2)} ports available`
        });
      }
    }
    
    return {
      passed: exceededResources.length === 0,
      exceededResources
    };
  };

  const checkAndShowQuotaError = (requirements: ResourceRequirements): boolean => {
    const result = checkResourceQuota(requirements);
    
    if (!result.passed) {
      toast("Insufficient Resource Quota", {
        description: React.createElement('div', {
          className: "flex flex-col items-center space-y-3 w-full min-w-max"
        }, 
          React.createElement('div', {
            className: "text-sm space-y-1 whitespace-nowrap"
          }, result.exceededResources.map((e, index) => 
            React.createElement('div', { 
              key: index, 
              className: "whitespace-nowrap flex items-center gap-2" 
            }, 
              React.createElement('span', { 
                dangerouslySetInnerHTML: {
                  __html: e.message.replace(/(\d+(?:\.\d+)?)/g, '<span class="text-red-500 font-semibold">$1</span>')
                }
              })
            )
          )),
          React.createElement('button', {
            onClick: openCostCenterApp,
            className: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap"
          }, "Go to Payment Center")
        ),
        duration: 8000,
        style: {
          minWidth: 'max-content',
          width: 'auto'
        }
      });
      return false;
    }
    
    return true;
  };

  return { 
    checkResourceQuota, 
    checkAndShowQuotaError,
    isLoading,
    quota 
  };
}