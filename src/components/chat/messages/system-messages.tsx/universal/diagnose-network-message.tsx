import React from "react";
import { ScanSearch } from "lucide-react";
import { ResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import BaseActionMessage from "../components/base-action-message";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { useNetworkStatus } from "@/hooks/sealos/network/use-network-status";

import {
  Table,
  TableBody,
  TableCaption,
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
  const { resource } = useResourceStatus(target);
  const { readyStatus } = useNetworkStatus(target);

  console.log("readyStatus", readyStatus);

  // Treat readyStatus as any to avoid type errors
  const networkStatus = readyStatus as any;

  return (
    <BaseActionMessage
      headerTitle={{
        icon: ScanSearch,
        name: "Diagnosis",
      }}
    >
      <div className="space-y-3">
        {networkStatus &&
        Array.isArray(networkStatus) &&
        networkStatus.length > 0 ? (
          <div className="overflow-hidden">
            <Table className="table-fixed w-full">
              <TableCaption>Network Status Diagnosis</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Ready</TableHead>
                  <TableHead className="w-1/2">URL</TableHead>
                  <TableHead className="w-1/3">Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {networkStatus.map((status: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="w-20">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          status.ready ? "bg-theme-green" : "bg-theme-red"
                        }`}
                      >
                        {status.ready ? "Ready" : "Not Ready"}
                      </span>
                    </TableCell>
                    <TableCell className="w-1/2 font-mono text-sm truncate" title={status.url}>
                      {status.url}
                    </TableCell>
                    <TableCell className="w-1/3 text-theme-red truncate" title={status.error || "None"}>
                      {status.error || "None"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-4">
            No network status data available
          </div>
        )}
      </div>
    </BaseActionMessage>
  );
};

export default DiagnoseNetworkMessage;
