import React, { useState } from "react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useQuery } from "@tanstack/react-query";
import { devboxClient } from "@/components/provider/trpc-provider";
import { BaseResourceMessage } from "@/components/chat/messages/system-messages.tsx/components/base-resource-message";
import { MessageAction } from "@/components/chat/messages/system-messages.tsx/components/base-resource-message";
import { MessagePopover } from "@/components/chat/messages/system-messages.tsx/components/message-popover";
import { History, Globe } from "lucide-react";
import { useAppendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import DevboxMessageMenu from "./components/devbox-message-menu";
import DevboxNodeIde from "@/components/flowgraph/node/sealos/devbox/devbox-node-ide";
import { 
  CpuMemorySection, 
  SshSection, 
  NetworkSection, 
  ReleaseSection 
} from "./components/devbox-message";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { useResourceMetricsStatus } from "@/hooks/sealos/resource/use-resource-metrics-status";
import { useDevboxRelease } from "@/hooks/sealos/devbox/use-devbox-release";
import { DevboxReleaseMessage } from "./devbox-release-message";

type ActiveSection = "resource" | "network" | "ssh" | "release" | null;

interface DevboxMessageProps {
  target: CustomResourceTarget;
}

export const DevboxMessage: React.FC<DevboxMessageProps> = ({ target }) => {
  const { appendSystemMessage } = useAppendSystemMessageMutation();
  const [activeSection, setActiveSection] = useState<ActiveSection>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const devboxTrpcClient = devboxClient.useTRPC();

  const {
    data: devboxObject,
    isLoading,
    error,
  } = useQuery(devboxTrpcClient.get.queryOptions(target));

  // Get data for popover content
  const { resource: devboxResource } = useResourceStatus(target);
  const { latestData, isLoading: isMetricsLoading } = useResourceMetricsStatus({ target });
  const { releases } = useDevboxRelease(target.name || "");

  const actions: MessageAction[] = devboxObject
    ? [
        // {
        //   icon: History,
        //   label: "Release History",
        //   onClick: () => {
        //     appendSystemMessage({ type: "devbox.release", target });
        //   },
        // },
        // {
        //   icon: Globe,
        //   label: "Ports",
        //   onClick: () => {
        //     appendSystemMessage({ type: "devbox.network", target });
        //   },
        // },
      ]
    : [];

  // Show loading state
  if (isLoading) {
    return (
      <BaseResourceMessage target={target}>
        <div className="flex items-center justify-center">
          <span className="text-muted-foreground">
            Loading devbox information...
          </span>
        </div>
      </BaseResourceMessage>
    );
  }

  // Show error state
  if (error || !devboxObject) {
    return (
      <BaseResourceMessage target={target}>
        <div className="flex items-center justify-center">
          <span className="text-destructive">
            Failed to load devbox information
          </span>
        </div>
      </BaseResourceMessage>
    );
  }

  // Handle section click
  const handleSectionClick = (section: ActiveSection) => {
    setActiveSection(section);
    setIsPopoverOpen(true);
  };

  // Dynamic popover content based on active section
  const getPopoverContent = () => {
    if (!activeSection) {
      return (
        <div className="space-y-4">
          <div className="border-b pb-2">
            <h3 className="font-semibold text-lg">Devbox Details</h3>
            <p className="text-sm text-muted-foreground">
              Click on any section to view detailed information
            </p>
          </div>
        </div>
      );
    }

    const sectionTitles = {
      resource: "Resource Information",
      network: "Network Configuration",
      ssh: "SSH Connection Details",
      release: "Release Information",
    };

    // Special handling for release section - show full component
    if (activeSection === "release") {
      return (
        <div className="w-full">
          <DevboxReleaseMessage target={target} />
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="border-b pb-2">
          <h3 className="font-semibold text-lg">{sectionTitles[activeSection]}</h3>
          <p className="text-sm text-muted-foreground">
            Detailed information for {target.name}
          </p>
        </div>
        
        <div className="p-4 bg-background-tertiary rounded-lg">
          <h4 className="font-medium mb-3 text-lg">{sectionTitles[activeSection]}</h4>
          <div className="text-sm space-y-2">
            {activeSection === "resource" && (
              <>
                <p><span className="font-medium">Name:</span> {target.name}</p>
                <p><span className="font-medium">Type:</span> {target.resourceType}</p>
                <p><span className="font-medium">Resource:</span> {target.plural}</p>
                <p><span className="font-medium">Group:</span> {target.group}</p>
                <p><span className="font-medium">Version:</span> {target.version}</p>
                
                <div className="border-t pt-2 mt-2">
                  <h5 className="font-medium mb-1">Resource Allocation</h5>
                  <p><span className="font-medium">CPU Allocated:</span> {devboxResource?.resources?.cpu || 0}</p>
                  <p><span className="font-medium">Memory Allocated:</span> {devboxResource?.resources?.memory || 0}</p>
                </div>
                
                <div className="border-t pt-2 mt-2">
                  <h5 className="font-medium mb-1">Current Usage</h5>
                  <p><span className="font-medium">CPU Usage:</span> {isMetricsLoading ? "Loading..." : `${(latestData?.cpu || 0).toFixed(1)}%`}</p>
                  <p><span className="font-medium">Memory Usage:</span> {isMetricsLoading ? "Loading..." : `${(latestData?.memory || 0).toFixed(1)}%`}</p>
                </div>
              </>
            )}
            {activeSection === "network" && (
              <>
                <p><span className="font-medium">Network Type:</span> Internal</p>
                <p><span className="font-medium">Domain:</span> {target.name}.devbox.local</p>
                <p><span className="font-medium">Protocol:</span> HTTP/HTTPS</p>
                <p><span className="font-medium">Status:</span> Active</p>
                <p><span className="font-medium">Ports:</span> {devboxResource?.ports?.length || 0}</p>
              </>
            )}
            {activeSection === "ssh" && (
              <>
                <p><span className="font-medium">Host:</span> {target.name}.devbox.local</p>
                <p><span className="font-medium">Port:</span> 22</p>
                <p><span className="font-medium">User:</span> root</p>
                <p><span className="font-medium">Key Type:</span> RSA</p>
                <p><span className="font-medium">Connection:</span> Secure</p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Main content with two-column layout using new components
  const mainContent = (
    <div className="flex gap-2">
      {/* Left Half - CPU/Memory and SSH */}
      <div className="w-1/2 space-y-2">
        <CpuMemorySection target={target} onSectionClick={() => handleSectionClick("resource")} />
        <SshSection target={target} onSectionClick={() => handleSectionClick("ssh")} />
      </div>

      {/* Right Half - Network and Release */}
      <div className="w-1/2 space-y-2">
        <NetworkSection target={target} onSectionClick={() => handleSectionClick("network")} />
        <ReleaseSection target={target} onSectionClick={() => handleSectionClick("release")} />
      </div>
    </div>
  );

  return (
    <MessagePopover
      popoverContent={getPopoverContent()}
      showTrigger={false}
      open={isPopoverOpen}
      onOpenChange={setIsPopoverOpen}
    >
      <BaseResourceMessage
        target={target}
        actions={actions}
        headerSlot={
          <div className="flex items-center gap-2">
            <DevboxNodeIde object={devboxObject} />
            <DevboxMessageMenu target={target} />
          </div>
        }
      >
        {mainContent}
      </BaseResourceMessage>
    </MessagePopover>
  );
};

export default DevboxMessage;
