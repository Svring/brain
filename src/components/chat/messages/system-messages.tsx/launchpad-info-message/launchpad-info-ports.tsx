import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface LaunchpadInfoPortsProps {
  ports: any[];
}

export const LaunchpadInfoPorts: React.FC<LaunchpadInfoPortsProps> = ({
  ports,
}) => {
  const [copyStates, setCopyStates] = useState<{ [key: string]: boolean }>({});

  const copyToClipboard = (text: string, label: string, key: string) => {
    navigator.clipboard.writeText(text);

    // Set the copy state to true (show check icon)
    setCopyStates((prev) => ({ ...prev, [key]: true }));

    // Reset back to copy icon after 5 seconds
    setTimeout(() => {
      setCopyStates((prev) => ({ ...prev, [key]: false }));
    }, 5000);
  };

  if (!ports || ports.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h4 className="font-medium">Ports ({ports.length})</h4>
      <div className="w-full overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Number</TableHead>
              <TableHead className="w-1/2">Private Address</TableHead>
              <TableHead className="w-1/2">Public Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ports.map((port: any, index: number) => (
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
                            "Private Address",
                            `private-${port.number}`
                          )
                        }
                      >
                        {copyStates[`private-${port.number}`] ? (
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
                            "Public Address",
                            `public-${port.number}`
                          )
                        }
                      >
                        {copyStates[`public-${port.number}`] ? (
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
    </div>
  );
};
