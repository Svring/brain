"use client";

import React, { useState } from "react";
import { GitBranch, Server } from "lucide-react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useDevboxRelease } from "@/hooks/sealos/devbox/use-devbox-release";
import { ReleaseChart } from "../../../components/release-chart";
import { DeploymentChart } from "../../../components/deployment-chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ReleaseSectionProps {
  target: CustomResourceTarget;
  onSectionClick: () => void;
}

// Release/Deployment Popover Content Component
export const ReleasePopoverContent: React.FC<{
  target: CustomResourceTarget;
}> = ({ target }) => {
  return (
    <div className="w-full rounded-lg">
      <Tabs defaultValue="releases" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="releases" className="text-xs">
            <GitBranch className="h-3 w-3 mr-1" />
            Releases
          </TabsTrigger>
          <TabsTrigger value="deployments" className="text-xs">
            <Server className="h-3 w-3 mr-1" />
            Deployments
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="releases" className="mt-3">
          <ReleaseChart target={target} />
        </TabsContent>
        
        <TabsContent value="deployments" className="mt-3">
          <DeploymentChart target={target} payload={{ tag: "" }} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export const ReleaseSection: React.FC<ReleaseSectionProps> = ({
  target,
  onSectionClick,
}) => {
  const { releases } = useDevboxRelease(target.name!);
  const releasesCount = releases?.length || 0;

  return (
    <div
      className="p-2 border rounded-lg cursor-pointer hover:bg-background-tertiary transition-colors"
      onClick={onSectionClick}
    >
      <div className="flex items-center gap-2">
        <GitBranch className="h-5 w-5 text-primary" />
        <div className="flex flex-col">
          <span className="font-medium text-sm">Release/Deployment</span>
          <span className="text-xs text-muted-foreground">
            {releasesCount} releases
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReleaseSection;
