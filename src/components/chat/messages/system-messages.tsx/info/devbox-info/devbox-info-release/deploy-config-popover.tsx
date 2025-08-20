import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ArrowBigUpDash } from "lucide-react";

interface DeployConfig {
  cpu: number;
  memory: number;
}

interface DeployConfigPopoverProps {
  releaseTag: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  deployConfig: DeployConfig;
  setDeployConfig: (config: DeployConfig) => void;
  onDeploy: (releaseTag: string, config: DeployConfig) => void;
  isPending: boolean;
  isDisabled?: boolean;
}

export const DeployConfigPopover: React.FC<DeployConfigPopoverProps> = ({
  releaseTag,
  isOpen,
  onOpenChange,
  deployConfig,
  setDeployConfig,
  onDeploy,
  isPending,
  isDisabled = false,
}) => {
  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          disabled={isDisabled}
        >
          <ArrowBigUpDash className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 z-[9999] bg-node-background"
        side="top"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Deploy Configuration</h4>
            <p className="text-xs text-muted-foreground">
              Configure deployment settings for {releaseTag}
            </p>
          </div>
          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label className="text-xs">CPU (millicores)</Label>
              <div className="grid grid-cols-3 gap-1">
                {[1000, 2000, 4000, 8000, 16000].map((cpu) => (
                  <Button
                    key={cpu}
                    onClick={() => {
                      setDeployConfig({
                        ...deployConfig,
                        cpu,
                      });
                    }}
                    variant={
                      deployConfig.cpu === cpu ? "default" : "outline"
                    }
                    size="sm"
                    className="h-7 text-xs"
                  >
                    {cpu}
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="text-xs">Memory (MB)</Label>
              <div className="grid grid-cols-3 gap-1">
                {[1024, 2048, 4096, 8192, 16384].map((memory) => (
                  <Button
                    key={memory}
                    onClick={() => {
                      setDeployConfig({
                        ...deployConfig,
                        memory,
                      });
                    }}
                    variant={
                      deployConfig.memory === memory ? "default" : "outline"
                    }
                    size="sm"
                    className="h-7 text-xs"
                  >
                    {memory}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={() => onDeploy(releaseTag, deployConfig)}
              size="sm"
              className="flex-1 h-8 text-xs"
              disabled={isPending || isDisabled}
            >
              {isPending ? "Deploying..." : "Deploy"}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
