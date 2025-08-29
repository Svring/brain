import React from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, Globe, HelpCircle, Settings } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
            <TableHead className="w-[10%]">Port</TableHead>
            <TableHead className="w-[30%]">Private Address</TableHead>
            <TableHead className="w-[60%]">Public Address</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ports.map((port: Port, index: number) => (
            <TableRow key={index}>
              <TableCell className="font-mono">{port.number}</TableCell>
              <TableCell className="max-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "truncate cursor-pointer hover:text-foreground/80 hover:underline",
                      port.privateAddress ? "text-foreground" : "text-muted-foreground"
                    )}
                    title={port.privateAddress || "-"}
                    onClick={() => {
                      if (port.privateAddress) {
                        copyToClipboard(port.privateAddress, `private-${port.number}`);
                      }
                    }}
                  >
                    {port.privateAddress || "-"}
                  </span>
                  {port.privateAddress && isCopied(`private-${port.number}`) && (
                    <Check className="w-3 h-3 text-theme-green flex-shrink-0" />
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
                          <Check className="w-3 h-3 text-theme-green" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 flex-shrink-0"
                          >
                            <Settings className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              console.log(`Update port ${port.number}`);
                            }}
                          >
                            Update
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              console.log(`Custom settings for port ${port.number}`);
                            }}
                          >
                            Custom
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
