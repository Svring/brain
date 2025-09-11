import React, { useState } from "react";
import {
  Check,
  Cpu,
  MemoryStick,
  PenLine,
  X,
  Target,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LaunchpadUpdateForm } from "@/components/forms/launchpad/launchpad-update-form";
import { LaunchpadUpdateFormData } from "@/schemas/forms/launchpad/launchpad-update-form-schema";
import { Spinner } from "@/components/ui/spinner";

interface ResourceAndDeploymentProps {
  resource?: {
    cpu?: number;
    memory?: number;
    replicas?: number;
  };
  strategy?: {
    type?: string;
    threshold?: {
      resource: string;
      usage: number;
    };
    minReplicas?: number;
    maxReplicas?: number;
  };
  onResourceAndDeploymentUpdate: (type: string, data?: any) => Promise<void>;
  isLoading?: boolean;
}

export const ResourceAndDeployment: React.FC<ResourceAndDeploymentProps> = ({
  resource,
  strategy,
  onResourceAndDeploymentUpdate,
  isLoading = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = async (data: LaunchpadUpdateFormData) => {
    // Pass the complete resource data structure including replicas
    await onResourceAndDeploymentUpdate("resource", {
      resource: {
        cpu: data.resource?.cpu,
        memory: data.resource?.memory,
        replicas: data.resource?.replicas,
      },
    });
    setIsEditing(false);
  };

  const getModeDisplay = () => {
    if (strategy?.type === "flexible") {
      return "Flexible";
    }
    return "Fixed";
  };

  const getReplicasDisplay = () => {
    if (strategy?.type === "flexible") {
      return `${strategy.minReplicas || 1}-${strategy.maxReplicas || 10}`;
    }
    return resource?.replicas || "N/A";
  };

  const getFlexibleDetails = () => {
    if (strategy?.type !== "flexible") return null;

    return {
      target: strategy.threshold?.resource || "CPU",
      type: strategy.threshold?.usage ? `${strategy.threshold.usage}%` : "N/A",
      minReplicas: strategy.minReplicas || 1,
      maxReplicas: strategy.maxReplicas || 10,
    };
  };

  return (
    <div className="border border-dashed rounded-lg">
      <div className="flex items-center justify-between p-2 border-b border-dashed">
        <h3 className="font-medium">Resource & Deployment</h3>
        {isEditing ? (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8"
              onClick={() => setIsEditing(false)}
              disabled={isLoading}
            >
              <X />
            </Button>
            <Button
              type="submit"
              form="launchpad-update-form"
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
            onClick={() => setIsEditing(true)}
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
      <div className={`${isEditing ? "p-4" : "p-2"}`}>
        {isEditing ? (
          <LaunchpadUpdateForm
            defaultValues={{
              resource: {
                cpu: resource?.cpu || 0.1,
                memory: resource?.memory || 0.5,
                replicas: resource?.replicas || 1,
              },
            }}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            hideDefaultButton={true}
          />
        ) : (
          <div className="flex items-center justify-around">
            {/* CPU */}
            <div className="flex flex-col items-center gap-1">
              <div className="text-sm text-muted-foreground">CPU</div>
              <Cpu className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm font-medium">
                {resource?.cpu ? `${resource.cpu}Core` : "N/A"}
              </div>
            </div>

            {/* Memory */}
            <div className="flex flex-col items-center gap-1">
              <div className="text-sm text-muted-foreground">Memory</div>
              <MemoryStick className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm font-medium">
                {resource?.memory ? `${resource.memory}GB` : "N/A"}
              </div>
            </div>

            {/* Mode */}
            <div className="flex flex-col items-center gap-1">
              <div className="text-sm text-muted-foreground">Mode</div>
              <div className="text-sm font-medium capitalize">
                {getModeDisplay()}
              </div>
            </div>

            {/* Replicas */}
            <div className="flex flex-col items-center gap-1">
              <div className="text-sm text-muted-foreground">Replicas</div>
              <div className="text-sm font-medium">{getReplicasDisplay()}</div>
            </div>

            {/* Flexible Strategy Details */}
            {strategy?.type === "flexible" && (
              <>
                <div className="flex flex-col items-center gap-1">
                  <div className="text-sm text-muted-foreground">Target</div>
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm font-medium capitalize">
                    {strategy.threshold?.resource || "CPU"}
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="text-sm text-muted-foreground">Type</div>
                  <div className="text-sm font-medium">
                    {strategy.threshold?.usage ? `${strategy.threshold.usage}%` : "N/A"}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
