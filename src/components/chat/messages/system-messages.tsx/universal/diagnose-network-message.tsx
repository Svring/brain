import React from "react";
import { ScanSearch, CheckCircle, HelpCircle } from "lucide-react";
import { ResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import BaseActionMessage from "../components/base-action-message";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { useNetworkStatus } from "@/hooks/sealos/network/use-network-status";
import { useContainerStatus } from "@/hooks/sealos/network/use-container-status";
import {
  extractContainerPorts,
  ContainerPortsResult,
} from "@/lib/sealos/services/ports/ports-utils";

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

export const DiagnoseNetworkMessage: React.FC<DiagnoseNetworkMessageProps> = ({
  target,
}) => {
  const { resource: containerPortsData, originalResource: resource } =
    useResourceStatus<ContainerPortsResult>(target, (resource) =>
      extractContainerPorts(resource?.ports)
    );
  const { readyStatus } = useNetworkStatus(target);

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
  const networkStatus = readyStatus as any;

  // console.log("containerPortsData", containerPortsData);
  // console.log("containerStatus", containerStatus);

  return (
    <BaseActionMessage
      headerTitle={{
        icon: ScanSearch,
        name: "Diagnosis",
      }}
    >
      {/* Port Status Table */}
      <div className="border rounded-lg">
        <div className="p-2">
          {isContainerLoading ? (
            <div className="text-center py-4 text-gray-500">
              Checking container port status...
            </div>
          ) : containerError ? (
            <div className="text-center py-4 text-theme-red">
              Error checking container status: {containerError.message}
            </div>
          ) : resource?.ports && resource.ports.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Port</TableHead>
                  <TableHead>Container</TableHead>
                  <TableHead>Public Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resource.ports.map((port: any, index: number) => {
                  // Get container status for this port
                  const containerPortStatus = containerStatus?.find(
                    (status: any) => status.port === port.number
                  );
                  const isContainerReachable =
                    containerPortStatus?.reachable ?? false;

                  // Get network status for this port
                  const networkPortStatus = networkStatus?.find(
                    (status: any) =>
                      status.url === port.publicAddress ||
                      status.url === port.privateAddress
                  );
                  const isNetworkReachable = networkPortStatus?.ready ?? false;

                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {port.number}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {isContainerReachable ? (
                            <CheckCircle className="h-4 w-4 text-theme-green" />
                          ) : (
                            <HelpCircle className="h-4 w-4 text-theme-yellow" />
                          )}
                          <span className="text-sm">
                            {isContainerReachable ? "Reachable" : "Unknown"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {isNetworkReachable ? (
                            <CheckCircle className="h-4 w-4 text-theme-green" />
                          ) : (
                            <HelpCircle className="h-4 w-4 text-theme-yellow" />
                          )}
                          <span className="text-sm">
                            {port.publicAddress || "N/A"}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No port information available
            </div>
          )}
        </div>
      </div>
    </BaseActionMessage>
  );
};

export default DiagnoseNetworkMessage;
