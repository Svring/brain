import React from "react";
import { CheckCircle, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CombinedStatusItem {
  number: number;
  containerAccess: boolean;
  publicAccessStatus: boolean;
  publicAddress: string;
  privateAddress: string;
}

interface NetworkChartProps {
  networkData: {
    combinedStatusData: CombinedStatusItem[];
  };
  isLoading?: boolean;
}

export const NetworkChart: React.FC<NetworkChartProps> = ({
  networkData,
  isLoading = false,
}) => {
  const combinedStatusData = networkData?.combinedStatusData || [];

  if (isLoading) {
    return (
      <div className="w-full overflow-hidden min-w-0">
        <div className="text-center py-4 text-gray-500">
          Checking container port status...
        </div>
      </div>
    );
  }

  if (!networkData || combinedStatusData.length === 0) {
    return (
      <div className="w-full overflow-hidden min-w-0">
        <div className="text-center py-4 text-gray-500">
          No port information available
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden min-w-0">
      <TooltipProvider>
        <Table>
          <TableHeader>
            <TableRow className="h-8">
              <TableHead className="w-[12%] min-w-[60px] py-1 text-sm">
                Port
              </TableHead>
              <TableHead className="w-[88%] min-w-0 py-1 text-sm">
                Address
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {combinedStatusData.map(
              (statusItem: CombinedStatusItem, index: number) => (
                <TableRow key={index}>
                  <TableCell className="font-mono pr-2 min-w-0">
                    {statusItem.number}
                  </TableCell>
                  <TableCell className="min-w-0 w-full">
                    <div className="space-y-2 min-w-0">
                      {/* Private Address */}
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs text-muted-foreground px-2 py-1 rounded-full w-12 text-center flex-shrink-0">
                          private
                        </span>
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              {statusItem.containerAccess ? (
                                <CheckCircle className="h-4 w-4 text-theme-green flex-shrink-0" />
                              ) : (
                                <HelpCircle className="h-4 w-4 text-theme-yellow flex-shrink-0" />
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
                          <span
                            className={cn(
                              "truncate flex-1 min-w-0 text-sm",
                              statusItem.privateAddress
                                ? "text-foreground"
                                : "text-muted-foreground"
                            )}
                            title={statusItem.privateAddress || "-"}
                          >
                            {statusItem.privateAddress || "-"}
                          </span>
                        </div>
                      </div>

                      {/* Public Address */}
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs text-muted-foreground px-2 py-1 rounded-full w-12 text-center flex-shrink-0">
                          public
                        </span>
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {statusItem.publicAddress &&
                            statusItem.publicAddress !== "N/A" && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  {statusItem.publicAccessStatus ? (
                                    <CheckCircle className="h-4 w-4 text-theme-green flex-shrink-0" />
                                  ) : (
                                    <HelpCircle className="h-4 w-4 text-theme-yellow flex-shrink-0" />
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
                            )}
                          {statusItem.publicAddress &&
                          statusItem.publicAddress !== "N/A" ? (
                            <span
                              className={cn(
                                "truncate cursor-pointer hover:text-foreground/80 hover:underline flex-1 min-w-0 text-sm",
                                "text-foreground"
                              )}
                              title={statusItem.publicAddress}
                              onClick={() => {
                                if (
                                  statusItem.publicAddress?.startsWith("http")
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
                          ) : (
                            <span className="text-muted-foreground truncate flex-1 min-w-0 text-sm">
                              No public access
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </TooltipProvider>
    </div>
  );
};

export default NetworkChart;
