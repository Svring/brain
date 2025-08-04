"use client";

import React from "react";
import { GlobeLock, Copy } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Port {
  number: number;
  privateAddress?: string;
}

interface NodeInternalUrlProps {
  ports?: Port[];
}

export default function NodeInternalUrl({ ports }: NodeInternalUrlProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="p-1 border-2 border-muted-foreground/20 rounded-full">
            <GlobeLock className="h-4 w-4 text-muted-foreground" />
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="bg-background-secondary rounded-lg"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <div className="p-2">
            {ports && ports.length > 0 ? (
              <Table>
                <TableCaption>Internal URLs for this service</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Port</TableHead>
                    <TableHead>Internal Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ports.map((port, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {port.number}
                      </TableCell>
                      <TableCell>
                        {port.privateAddress ? (
                          <div className="flex items-center gap-2">
                            <span
                              className="font-mono text-xs bg-muted px-2 py-1 rounded cursor-pointer hover:bg-muted/80 transition-colors"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                navigator.clipboard.writeText(
                                  port.privateAddress!
                                );
                                toast("Private address copied to clipboard");
                              }}
                            >
                              {port.privateAddress}
                            </span>
                            <Copy
                              className="h-3 w-3 hover:text-foreground cursor-pointer transition-colors flex-shrink-0"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                navigator.clipboard.writeText(
                                  port.privateAddress!
                                );
                                toast("Private address copied to clipboard");
                              }}
                            />
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-sm">No ports available</div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
