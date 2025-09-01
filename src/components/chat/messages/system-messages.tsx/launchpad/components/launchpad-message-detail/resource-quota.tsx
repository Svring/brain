import React, { useState } from "react";
import { Cpu, MemoryStick, PenLine, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LaunchpadUpdateForm } from "@/components/forms/launchpad/launchpad-update-form";
import { LaunchpadUpdateFormData } from "@/schemas/forms/launchpad/launchpad-update-form-schema";

interface ResourceQuotaProps {
  resource?: {
    cpu?: number;
    memory?: number;
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

  const handleResourceSubmit = async (data: LaunchpadUpdateFormData) => {
    await onResourceUpdate("resource", data);
    setIsResourceEditing(false);
  };

  return (
    <div className="border border-dashed rounded-lg">
      <div className="flex items-center justify-between p-2 border-b border-dashed">
        <h3 className="font-medium">Quota</h3>
        {isResourceEditing ? (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-1"
              onClick={() => setIsResourceEditing(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            className="h-6 w-6 p-1"
            onClick={() => setIsResourceEditing(true)}
          >
            <PenLine className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className={`${isResourceEditing ? "p-4" : "p-2"}`}>
        {isResourceEditing ? (
          <LaunchpadUpdateForm
            defaultValues={{
              resource: {
                cpu: resource?.cpu || 0.1,
                memory: resource?.memory || 0.5,
              },
            }}
            onSubmit={handleResourceSubmit}
            isLoading={isLoading}
          />
        ) : (
          <div className="flex items-center justify-around">
            <div className="flex flex-col items-center gap-1">
              <div className="text-sm text-muted-foreground">CPU</div>
              <Cpu className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm font-medium">
                {resource?.cpu ? `${resource.cpu}Core` : "N/A"}
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="text-sm text-muted-foreground">Memory</div>
              <MemoryStick className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm font-medium">
                {resource?.memory ? `${resource.memory}GB` : "N/A"}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
