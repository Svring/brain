import React from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useCopy } from "@/hooks/use-copy";
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
      <Table className="border border-dashed rounded-lg">
        <TableHeader>
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
                  <span
                    className="truncate"
                    title={port.publicAddress || "-"}
                  >
                    {port.publicAddress || "-"}
                  </span>
                  {port.publicAddress && (
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
