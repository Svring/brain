"use client";

import React from "react";
import { EthernetPort, Copy, Check } from "lucide-react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useAuthState } from "@/contexts/auth/auth-context";
import { useCopy } from "@/hooks/use-copy";
import { ClusterObjectSchema } from "@/lib/sealos/resources/cluster/cluster-schemas/cluster-object-schema";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { Button } from "@/components/ui/button";
import {
  composeClusterPublicConnectionString,
  composeClusterPrivateConnectionString,
} from "@/lib/sealos/resources/cluster/cluster-method/cluster-utils";

interface ConnectSectionProps {
  target: CustomResourceTarget;
  onSectionClick: () => void;
}

// Connect Popover Content Component
export const ConnectPopoverContent: React.FC<{
  target: CustomResourceTarget;
}> = ({ target }) => {
  const { auth } = useAuthState();
  const { copyToClipboard, isCopied } = useCopy();
  const { resource: clusterResource } = useResourceStatus(target);

  const namespace = auth?.namespace;
  const regionUrl = auth?.regionUrl;
  const parsedClusterObject = clusterResource
    ? ClusterObjectSchema.parse(clusterResource)
    : null;

  if (!parsedClusterObject) {
    return (
      <div className="bg-background-tertiary rounded-lg">
        <p className="text-sm text-muted-foreground">
          Cluster connection information not available
        </p>
      </div>
    );
  }

  const publicConnectionString = composeClusterPublicConnectionString(
    parsedClusterObject,
    namespace || "",
    regionUrl || ""
  );

  const privateConnectionString = composeClusterPrivateConnectionString(
    parsedClusterObject,
    namespace || "",
    regionUrl || ""
  );

  return (
    <div className="rounded-lg">
      <div className="space-y-3">
        {/* Public Connection */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Public Connection</h4>
          <div className="flex items-center justify-between min-w-0 w-full rounded-lg p-1 px-2 bg-background-tertiary border border-border-primary">
            <span className="text-sm font-mono text-foreground flex-1 truncate mr-2">
              {publicConnectionString}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 flex-shrink-0"
              onClick={() => {
                copyToClipboard(publicConnectionString, "public-connection");
              }}
            >
              {isCopied("public-connection") ? (
                <Check className="h-4 w-4 text-theme-green" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Private Connection */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Private Connection</h4>
          <div className="flex items-center justify-between min-w-0 w-full rounded-lg p-1 px-2 bg-background-tertiary border border-border-primary">
            <span className="text-sm font-mono text-foreground flex-1 truncate mr-2">
              {privateConnectionString}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 flex-shrink-0"
              onClick={() => {
                copyToClipboard(privateConnectionString, "private-connection");
              }}
            >
              {isCopied("private-connection") ? (
                <Check className="h-4 w-4 text-theme-green" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ConnectSection: React.FC<ConnectSectionProps> = ({
  target,
  onSectionClick,
}) => {
  return (
    <div
      className="p-2 border rounded-lg cursor-pointer hover:bg-background-secondary transition-colors"
      onClick={onSectionClick}
    >
      <div className="flex items-center gap-2">
        <EthernetPort className="h-5 w-5 text-primary" />
        <div className="flex flex-col">
          <span className="font-medium text-sm">Connect</span>
          <span className="text-xs text-muted-foreground">Connection</span>
        </div>
      </div>
    </div>
  );
};

export default ConnectSection;
