"use client";

import React from "react";
import { Copy, Check, Globe, HelpCircle } from "lucide-react";
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
import { Button } from "@/components/ui/button";

interface LaunchpadPort {
  port?: number;
  number?: number;
  protocol?: string;
  appProtocol?: string;
  exposesPublicDomain?: boolean;
  serviceName?: string;
  portName?: string;
  nodePort?: number;
  networkName?: string;
  publicDomain?: string;
  domain?: string;
  customDomain?: string;
  privateAddress?: string;
  publicAddress?: string;
  host?: string;
  privateHost?: string;
}

interface LaunchpadPortDisplayTableProps {
  ports: LaunchpadPort[];
}

export function LaunchpadPortDisplayTable({ ports }: LaunchpadPortDisplayTableProps) {
  const { copyToClipboard, isCopied } = useCopy();

  if (!ports || ports.length === 0) {
    return (
      <div className="text-center py-4">
        <Globe className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          No network ports configured
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden min-w-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[15%] min-w-[60px]">Port</TableHead>
            <TableHead className="w-[20%] min-w-[80px]">Protocol</TableHead>
            <TableHead className="w-[30%] min-w-0">Private Address</TableHead>
            <TableHead className="w-[35%] min-w-0">Public Address</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ports.map((port: LaunchpadPort, index: number) => {
            const portNumber = port.port || port.number || 0;
            return (
            <TableRow key={index}>
              <TableCell className="font-mono min-w-0">
                <div className="flex flex-col min-w-0">
                  <span className="truncate">{portNumber}</span>
                  {port.nodePort && port.nodePort !== portNumber && (
                    <span className="text-xs text-muted-foreground truncate">
                      Node: {port.nodePort}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="min-w-0">
                <div className="flex flex-col min-w-0">
                  <span className="text-sm truncate">{port.protocol || "TCP"}</span>
                  {port.appProtocol && (
                    <span className="text-xs text-muted-foreground truncate">
                      {port.appProtocol}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="min-w-0 w-full">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={cn(
                      "truncate cursor-pointer hover:text-foreground/80 hover:underline flex-1 min-w-0",
                      port.privateAddress || port.privateHost || port.serviceName
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                    title={port.privateAddress || port.privateHost || port.serviceName || "-"}
                    onClick={() => {
                      const address = port.privateAddress || port.privateHost || port.serviceName;
                      if (address) {
                        copyToClipboard(
                          address,
                          `private-${portNumber}`
                        );
                      }
                    }}
                  >
                    {port.privateAddress || port.privateHost || port.serviceName || "-"}
                  </span>
                  {(port.privateAddress || port.privateHost || port.serviceName) &&
                    isCopied(`private-${portNumber}`) && (
                      <Check className="w-3 h-3 text-theme-green flex-shrink-0" />
                    )}
                </div>
              </TableCell>
              <TableCell className="min-w-0 w-full">
                <div className="flex items-center gap-2 min-w-0">
                  {port.publicAddress || port.publicDomain || port.customDomain || port.domain ? (
                    <>
                      <Globe
                        className={cn(
                          "h-4 w-4 flex-shrink-0",
                          (port.publicAddress || port.publicDomain || port.customDomain || port.domain)?.startsWith("http")
                            ? "text-theme-green"
                            : "text-theme-blue"
                        )}
                      />
                      <span
                        className={cn(
                          "truncate flex-1 min-w-0",
                          (port.publicAddress || port.publicDomain || port.customDomain || port.domain)?.startsWith("http")
                            ? "text-foreground cursor-pointer hover:text-foreground/80"
                            : "text-foreground"
                        )}
                        title={port.publicAddress || port.publicDomain || port.customDomain || port.domain}
                        onClick={() => {
                          const publicUrl = port.publicAddress || port.publicDomain || port.customDomain || port.domain;
                          if (publicUrl?.startsWith("http")) {
                            window.open(publicUrl, "_blank");
                          }
                        }}
                      >
                        {port.publicAddress || port.publicDomain || port.customDomain || port.domain}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 flex-shrink-0"
                        onClick={() =>
                          copyToClipboard(
                            port.publicAddress || port.publicDomain || port.customDomain || port.domain || "",
                            `public-${portNumber}`
                          )
                        }
                      >
                        {isCopied(`public-${portNumber}`) ? (
                          <Check className="w-3 h-3 text-theme-green" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </>
                  ) : (
                    <>
                      <HelpCircle className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      <span className="text-muted-foreground truncate flex-1 min-w-0">
                        {port.exposesPublicDomain ? "Configuring..." : "No public access"}
                      </span>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export default LaunchpadPortDisplayTable;
