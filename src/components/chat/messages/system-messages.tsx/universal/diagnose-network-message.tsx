import React from "react";
import { ScanSearch, CheckCircle, HelpCircle } from "lucide-react";
import { ResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import BaseSystemMessage from "../components/base-system-message";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { useNetworkStatus } from "@/hooks/sealos/network/use-network-status";
import { useContainerStatus } from "@/hooks/sealos/network/use-container-status";
import {
  extractContainerPorts,
  ContainerPortsResult,
} from "@/lib/sealos/services/ports/ports-utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DiagnoseNetworkMessageProps {
  target: ResourceTarget;
}

interface CombinedStatusItem {
  number: number;
  containerAccess: boolean;
  publicAccessStatus: boolean;
  publicAddress: string;
  privateAddress: string;
}

export const DiagnoseNetworkMessage: React.FC<DiagnoseNetworkMessageProps> = ({
  target,
}) => {
  const { resource: containerPortsData, originalResource: resource } =
    useResourceStatus<ContainerPortsResult>(target, (resource) =>
      extractContainerPorts(resource?.ports)
    );
  const { readyStatus: publicAddressStatus } = useNetworkStatus(target);

  // Use container status hook
  const {
    data: containerStatus,
    isLoading: isContainerLoading,
    error: containerError,
  } = useContainerStatus(
    containerPortsData?.ports || [],
    containerPortsData?.host || "",
    2000 // 2 second timeout
  );

  // Treat readyStatus as any to avoid type errors
  const networkStatus = publicAddressStatus as any;

  // Combine container status and public address status into a single array
  const combinedStatusData = React.useMemo((): CombinedStatusItem[] => {
    if (!resource?.ports || !Array.isArray(resource.ports)) {
      return [];
    }

    return resource.ports.map((port: any): CombinedStatusItem => {
      // Get container status for this port
      const containerPortStatus = containerStatus?.find(
        (status: any) => status.port === port.number
      );
      const containerAccess = containerPortStatus?.reachable ?? false;

      // Get network status for this port
      const networkPortStatus = networkStatus?.find(
        (status: any) =>
          status.url === port.publicAddress ||
          status.url === port.privateAddress
      );
      const publicAccessStatus = networkPortStatus?.ready ?? false;

      return {
        number: port.number,
        containerAccess,
        publicAccessStatus,
        publicAddress: port.publicAddress || "N/A",
        privateAddress: port.privateAddress || "N/A",
      };
    });
  }, [resource?.ports, containerStatus, networkStatus]);

  // console.log("containerPortsData", containerPortsData);
  // console.log("containerStatus", containerStatus);
  // console.log("combinedStatusData", combinedStatusData);

  return (
    <BaseSystemMessage
      headerTitle={{
        icon: ScanSearch,
        name: "Diagnosis",
      }}
    >
      {/* Port Status Table */}
      <div className="rounded-lg">
        <div className="">
          {isContainerLoading ? (
            <div className="text-center py-4 text-gray-500">
              Checking container port status...
            </div>
          ) : containerError ? (
            <div className="text-center py-4 text-theme-red">
              Error checking container status: {containerError.message}
            </div>
          ) : combinedStatusData.length > 0 ? (
            <TooltipProvider>
              <div className="overflow-hidden">
                <Table className="table-fixed w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[10%]">Port</TableHead>
                      <TableHead className="w-[45%]">
                        Private Address Status
                      </TableHead>
                      <TableHead className="w-[45%]">
                        Public Address Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {combinedStatusData.map(
                      (statusItem: CombinedStatusItem, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {statusItem.number}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  {statusItem.containerAccess ? (
                                    <CheckCircle className="h-4 w-4 text-theme-green" />
                                  ) : (
                                    <HelpCircle className="h-4 w-4 text-theme-yellow" />
                                  )}
                                </TooltipTrigger>
                                <TooltipContent
                                  side="bottom"
                                  align="start"
                                  className="bg-background-tertiary border border-border-primary"
                                >
                                  <p>
                                    {statusItem.containerAccess
                                      ? "Available"
                                      : "Unavailable"}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                              <span className="text-sm truncate">
                                {statusItem.privateAddress}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  {statusItem.publicAccessStatus ? (
                                    <CheckCircle className="h-4 w-4 text-theme-green" />
                                  ) : (
                                    <HelpCircle className="h-4 w-4 text-theme-yellow" />
                                  )}
                                </TooltipTrigger>
                                <TooltipContent
                                  side="bottom"
                                  align="start"
                                  className="bg-background-tertiary border border-border-primary"
                                >
                                  <p>
                                    {statusItem.publicAccessStatus
                                      ? "Available"
                                      : "Unavailable"}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                              <span
                                className={`text-sm truncate ${
                                  statusItem.publicAccessStatus &&
                                  statusItem.publicAddress !== "N/A"
                                    ? "cursor-pointer hover:underline"
                                    : ""
                                }`}
                                onClick={() => {
                                  if (
                                    statusItem.publicAccessStatus &&
                                    statusItem.publicAddress !== "N/A"
                                  ) {
                                    window.open(
                                      statusItem.publicAddress,
                                      "_blank"
                                    );
                                  }
                                }}
                              >
                                {statusItem.publicAddress}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </div>
            </TooltipProvider>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No port information available
            </div>
          )}
        </div>
      </div>
    </BaseSystemMessage>
  );
};

export default DiagnoseNetworkMessage;
