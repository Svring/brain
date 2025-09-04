import React, { useState } from "react";
import { Check, Cpu, MemoryStick, HardDrive, Apple, PenLine, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClusterUpdateForm } from "@/components/forms/cluster/cluster-update-form";
import { ClusterUpdateFormData } from "@/schemas/forms/cluster/cluster-update-form-schema";
import { Spinner } from "@/components/ui/spinner";

interface ResourceQuotaProps {
  resource?: {
    cpu?: number;
    memory?: number;
    storage?: number;
    replicas?: number;
  };
  onResourceUpdate: (type: string, data?: any) => Promise<void>;
  isLoading?: boolean;
}

export const ResourceQuota: React.FC<ResourceQuotaProps> = ({
  resource,
  onResourceUpdate,
  isLoading = false,
}) => {
  const [isResourceEditing, setIsResourceEditing] = useState(false);

  const handleResourceSubmit = async (data: ClusterUpdateFormData) => {
    // Pass the complete resource data structure
    await onResourceUpdate("resource", {
      resource: {
        cpu: data.resource?.cpu,
        memory: data.resource?.memory,
        storage: data.resource?.storage,
        replicas: data.resource?.replicas,
      },
    });
    setIsResourceEditing(false);
  };

  const formatValue = (value: any, type: "cpu" | "memory" | "storage") => {
    if (!value) return "N/A";
    if (type === "cpu") return `${value}Core`;
    if (type === "memory") return `${value}GB`;
    if (type === "storage") return `${value}GB`;
    return value;
  };

  return (
    <div className="border border-dashed rounded-lg">
      <div className="flex items-center justify-between p-2 border-b border-dashed">
        <h3 className="font-medium">Resource Quota</h3>
        {isResourceEditing ? (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8"
              onClick={() => setIsResourceEditing(false)}
              disabled={isLoading}
            >
              <X />
            </Button>
            <Button
              type="submit"
              form="cluster-update-form"
              variant="outline"
              size="sm"
              className="h-8 w-8"
              disabled={isLoading}
            >
              {isLoading ? (
                <Spinner variant="bars" className="h-4 w-4" />
              ) : (
                <Check />
              )}
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8"
            onClick={() => setIsResourceEditing(true)}
            disabled={isLoading}
          >
            {isLoading ? (
              <Spinner variant="bars" className="h-4 w-4" />
            ) : (
              <PenLine />
            )}
          </Button>
        )}
      </div>
      <div className={`${isResourceEditing ? "p-4" : "p-2"}`}>
        {isResourceEditing ? (
          <ClusterUpdateForm
            defaultValues={{
              resource: {
                cpu: resource?.cpu || 2,
                memory: resource?.memory || 4,
                storage: resource?.storage || 10,
                replicas: resource?.replicas || 1,
              },
            }}
            onSubmit={handleResourceSubmit}
            isLoading={isLoading}
            hideDefaultButton={true}
          />
        ) : (
          <div className="flex items-center justify-around">
            <div className="flex flex-col items-center gap-1">
              <div className="text-sm text-muted-foreground">CPU</div>
              <Cpu className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm font-medium">
                {formatValue(resource?.cpu, "cpu")}
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="text-sm text-muted-foreground">Memory</div>
              <MemoryStick className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm font-medium">
                {formatValue(resource?.memory, "memory")}
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="text-sm text-muted-foreground">Storage</div>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm font-medium">
                {formatValue(resource?.storage, "storage")}
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="text-sm text-muted-foreground">Replicas</div>
              <Apple className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm font-medium">
                {resource?.replicas || "N/A"}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
