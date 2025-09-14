import React, { useState } from "react";
import { Check, PenLine, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LaunchpadUpdateForm } from "@/components/forms/launchpad/launchpad-update-form";
import { LaunchpadUpdateFormData } from "@/schemas/forms/launchpad/launchpad-update-form-schema";
import { Spinner } from "@/components/ui/spinner";

interface DeploymentProps {
  resource?: {
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
  onDeploymentUpdate: (type: string, data?: any) => Promise<void>;
  isLoading?: boolean;
}

export const Deployment: React.FC<DeploymentProps> = ({
  resource,
  strategy,
  onDeploymentUpdate,
  isLoading = false,
}) => {
  const [isReplicasEditing, setIsReplicasEditing] = useState(false);

  const handleReplicasSubmit = async (data: LaunchpadUpdateFormData) => {
    await onDeploymentUpdate("replicas", {
      resource: {
        replicas: data.resource?.replicas,
      },
    });
    setIsReplicasEditing(false);
  };

  return (
    <div className="border border-dashed rounded-lg">
      <div className="flex items-center justify-between p-2 border-b border-dashed">
        <h3 className="font-medium">Deployment Strategy</h3>
        {isReplicasEditing ? (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8"
              onClick={() => setIsReplicasEditing(false)}
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
        ) : strategy?.type !== "flexible" ? (
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8"
            onClick={() => setIsReplicasEditing(true)}
            disabled={isLoading}
          >
            {isLoading ? (
              <Spinner variant="bars" className="h-4 w-4" />
            ) : (
              <PenLine />
            )}
          </Button>
        ) : null}
      </div>
      <div className={`p-2 ${isReplicasEditing ? "p-4" : "p-2"}`}>
        {isReplicasEditing ? (
          <LaunchpadUpdateForm
            defaultValues={{
              resource: {
                replicas: resource?.replicas || 1,
              },
            }}
            onSubmit={handleReplicasSubmit}
            isLoading={isLoading}
            hideDefaultButton={true}
          />
        ) : (
          <div className="flex items-center justify-around">
            <div className="flex flex-col items-center gap-1">
              <div className="text-sm text-muted-foreground">Mode</div>
              <div className="text-sm font-medium capitalize">
                {strategy?.type || "Fixed"}
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="text-sm text-muted-foreground">Replicas</div>
              <div className="text-sm font-medium">
                {resource?.replicas || "N/A"}
              </div>
            </div>
            {strategy?.type === "flexible" && strategy.threshold && (
              <>
                <div className="flex flex-col items-center gap-1">
                  <div className="text-sm text-muted-foreground">Resource</div>
                  <div className="text-sm font-medium capitalize">
                    {strategy.threshold.resource}
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="text-sm text-muted-foreground">Usage</div>
                  <div className="text-sm font-medium">
                    {strategy.threshold.usage}%
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
