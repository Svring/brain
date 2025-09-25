import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, HelpCircle } from "lucide-react";
import { useCopy } from "@/hooks/use-copy";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CustomPortDialog from "./custom-port-dialog";
import type {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

interface Port {
  number: number;
  privateAddress?: string;
  publicAddress?: string;
  protocol?: string;
  name?: string;
  serviceName?: string;
  host?: string;
  customDomain?: string;
}

interface PortDisplayTableProps {
  ports: Port[];
  devboxTarget?: CustomResourceTarget;
  target?: CustomResourceTarget | BuiltinResourceTarget;
  onCustomDomainUpdated?: () => void;
}

export function PortDisplayTable({
  ports,
  devboxTarget,
  target,
  onCustomDomainUpdated,
}: PortDisplayTableProps) {
  const { copyToClipboard, isCopied } = useCopy();
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);
  const [selectedPort, setSelectedPort] = useState<Port | null>(null);

  if (!ports || ports.length === 0) {
    return null;
  }

  return (
    <div className="w-full overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[10%]">Port</TableHead>
            <TableHead className="w-[90%]">Address</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ports.map((port: Port, index: number) => (
            <TableRow key={index}>
              <TableCell className="font-mono pr-13">{port.number}</TableCell>
              <TableCell className="max-w-0">
                <div className="space-y-2">
                  {/* Private Address */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground px-2 py-1 rounded-full w-12 text-center">
                      private
                    </span>
                    <div className="flex items-center gap-2 flex-1">
                      <span
                        className={cn(
                          "truncate cursor-pointer hover:text-foreground/80 hover:underline",
                          port.privateAddress
                            ? "text-foreground"
                            : "text-muted-foreground"
                        )}
                        title={port.privateAddress || "-"}
                        onClick={() => {
                          if (port.privateAddress) {
                            copyToClipboard(
                              port.privateAddress,
                              `private-${port.number}`
                            );
                          }
                        }}
                      >
                        {port.privateAddress || "-"}
                      </span>
                      {port.privateAddress && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 flex-shrink-0"
                          onClick={() =>
                            copyToClipboard(
                              port.privateAddress!,
                              `private-${port.number}`
                            )
                          }
                        >
                          {isCopied(`private-${port.number}`) ? (
                            <Check className="w-3 h-3 text-theme-green" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Public Address */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground px-2 py-1 rounded-full w-12 text-center">
                      public
                    </span>
                    <div className="flex items-center gap-2 flex-1">
                      {port.publicAddress ? (
                        <>
                          <span
                            className={cn(
                              "truncate cursor-pointer hover:text-foreground/80 hover:underline",
                              "text-foreground"
                            )}
                            title={port.publicAddress}
                            onClick={() => {
                              if (port.publicAddress?.startsWith("http")) {
                                window.open(port.publicAddress, "_blank");
                              }
                            }}
                          >
                            {port.publicAddress}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 flex-shrink-0"
                            onClick={() =>
                              copyToClipboard(
                                port.publicAddress!,
                                `public-${port.number}`
                              )
                            }
                          >
                            {isCopied(`public-${port.number}`) ? (
                              <Check className="w-3 h-3 text-theme-green" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => {
                              setSelectedPort(port);
                              setIsCustomDialogOpen(true);
                            }}
                          >
                            {port.customDomain ? "Edit" : "Custom"}
                          </Button>
                        </>
                      ) : (
                        <>
                          <HelpCircle className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            No public access
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Custom Domain */}
                  {port.customDomain && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground px-2 py-1 rounded-full w-12 text-center">
                        custom
                      </span>
                      <div className="flex items-center gap-2 flex-1">
                        <span
                          className={cn(
                            "truncate cursor-pointer hover:text-foreground/80 hover:underline",
                            "text-foreground"
                          )}
                          title={port.customDomain}
                          onClick={() => {
                            window.open(
                              `https://${port.customDomain}`,
                              "_blank"
                            );
                          }}
                        >
                          {port.customDomain}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 flex-shrink-0"
                          onClick={() =>
                            copyToClipboard(
                              port.customDomain!,
                              `custom-${port.number}`
                            )
                          }
                        >
                          {isCopied(`custom-${port.number}`) ? (
                            <Check className="w-3 h-3 text-theme-green" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Custom Port Dialog */}
      {target && (
        <CustomPortDialog
          open={isCustomDialogOpen}
          onOpenChange={setIsCustomDialogOpen}
          selectedPort={selectedPort}
          target={target}
        />
      )}
    </div>
  );
}

export default PortDisplayTable;
