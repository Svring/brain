import React from "react";
import { Button } from "@/components/ui/button";
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

interface Port {
  number: number;
  privateAddress?: string;
  publicAddress?: string;
  protocol?: string;
  name?: string;
  serviceName?: string;
  host?: string;
}

interface PortDisplayTableProps {
  ports: Port[];
}

export function PortDisplayTable({ ports }: PortDisplayTableProps) {
  const { copyToClipboard, isCopied } = useCopy();

  if (!ports || ports.length === 0) {
    return null;
  }

  return (
    <div className="w-full overflow-hidden">
      <Table>
        <TableHeader >
          <TableRow>
            <TableHead className="w-20">Number</TableHead>
            <TableHead className="w-1/2">Private Address</TableHead>
            <TableHead className="w-1/2">Public Address</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ports.map((port: Port, index: number) => (
            <TableRow key={index}>
              <TableCell className="font-mono">{port.number}</TableCell>
              <TableCell className="max-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="truncate"
                    title={port.privateAddress || "-"}
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
                        <Check className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  )}
                </div>
              </TableCell>
              <TableCell className="max-w-0">
                <div className="flex items-center gap-2">
                  {port.publicAddress ? (
                    <>
                      <Globe
                        className={cn(
                          "h-4 w-4 flex-shrink-0",
                          port.publicAddress.startsWith("http")
                            ? "text-theme-green"
                            : "text-theme-blue"
                        )}
                      />
                      <span
                        className={cn(
                          "truncate",
                          port.publicAddress.startsWith("http")
                            ? "text-foreground cursor-pointer hover:text-foreground/80"
                            : "text-foreground"
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
                          <Check className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </>
                  ) : (
                    <>
                      <HelpCircle className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      <span className="text-muted-foreground">No public access</span>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default PortDisplayTable;
