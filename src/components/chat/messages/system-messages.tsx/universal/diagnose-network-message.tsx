import React from "react";
import {
  ScanSearch,
  Wifi,
  WifiOff,
  ChevronDown,
  ChevronRight,
  File,
  Server,
} from "lucide-react";
import { ResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import BaseActionMessage from "../components/base-action-message";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { useNetworkStatus } from "@/hooks/sealos/network/use-network-status";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface DiagnoseNetworkMessageProps {
  target: ResourceTarget;
}

export const DiagnoseNetworkMessage: React.FC<DiagnoseNetworkMessageProps> = ({
  target,
}) => {
  const { resource } = useResourceStatus(target);
  const { readyStatus } = useNetworkStatus(target);
  const [isOpen, setIsOpen] = React.useState(true);

  console.log("resource", resource);
  console.log("readyStatus", readyStatus);

  // Treat readyStatus as any to avoid type errors
  const networkStatus = readyStatus as any;

  // Count inaccessible websites
  const inaccessibleCount =
    networkStatus?.filter((status: any) => !status.ready)?.length || 0;

  // Get unready URLs from networkStatus
  const unreadyUrls =
    networkStatus?.filter((status: any) => !status.ready) || [];

  // Filter ports that match unready URLs
  const unreadyPorts =
    resource?.ports?.filter((port: any) => {
      return unreadyUrls.some((urlStatus: any) => {
        // Check if the port's public address matches the unready URL
        return (
          urlStatus.url === port.publicAddress ||
          urlStatus.url === port.privateAddress
        );
      });
    }) || [];

  return (
    <BaseActionMessage
      headerTitle={{
        icon: ScanSearch,
        name: "Diagnosis",
      }}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="border rounded-lg">
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-sm font-medium">
            <div className="flex items-center space-x-2">
              <Wifi className="h-4 w-4" />
              <span>Network Status</span>
              {inaccessibleCount > 0 && (
                <span className="text-theme-yellow">
                  ({inaccessibleCount} inaccessible)
                </span>
              )}
            </div>
            {isOpen ? (
              <ChevronDown className="h-4 w-4 transition-transform duration-200" />
            ) : (
              <ChevronRight className="h-4 w-4 transition-transform duration-200" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="p-2">
            <div className="space-y-2">
              {networkStatus &&
              Array.isArray(networkStatus) &&
              networkStatus.length > 0 ? (
                <div className="space-y-2">
                  {networkStatus.map((status: any, index: number) => (
                    <div key={index} className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {status.ready ? (
                            <Wifi className="h-4 w-4 text-theme-green" />
                          ) : (
                            <WifiOff className="h-4 w-4 text-theme-yellow" />
                          )}
                        </div>
                        <div className="text-sm truncate">
                          <a
                            href={status.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline cursor-pointer"
                          >
                            {status.url}
                          </a>
                        </div>
                      </div>
                      {status.error && (
                        <div className="text-xs text-theme-red">
                          <span className="font-medium">Error message:</span>{" "}
                          {status.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  No network status data available
                </div>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Service Configuration Section */}
      {unreadyPorts.length > 0 && (
        <Collapsible defaultOpen>
          <div className="border rounded-lg mt-3">
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-sm font-medium">
              <div className="flex items-center space-x-2">
                <File className="h-4 w-4" />
                <span>Service Configuration</span>
                <span className="text-theme-green">
                  ({unreadyPorts.length} configured)
                </span>
              </div>
              <ChevronDown className="h-4 w-4 transition-transform duration-200" />
            </CollapsibleTrigger>
            <CollapsibleContent className="p-2">
              <div className="space-y-2">
                {unreadyPorts.map((port: any, index: number) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <File className="h-4 w-4 text-theme-green" />
                    </div>
                    <span className="text-sm rounded">
                      {port.serviceName || "Unknown"}
                    </span>
                    <span className="text-sm rounded">{port.number}</span>
                    <div className="text-sm">{port.protocol}</div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      )}

      {/* Container Status Section */}
      <Collapsible defaultOpen>
        <div className="border rounded-lg mt-3">
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-sm font-medium">
            <div className="flex items-center space-x-2">
              <File className="h-4 w-4" />
              <span>Container Status</span>
            </div>
            <ChevronDown className="h-4 w-4 transition-transform duration-200" />
          </CollapsibleTrigger>
          <CollapsibleContent className="p-2">
            <div className="text-center py-4 text-gray-500">
              Container status information will be displayed here
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </BaseActionMessage>
  );
};

export default DiagnoseNetworkMessage;
