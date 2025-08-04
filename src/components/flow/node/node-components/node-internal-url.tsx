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
          className="bg-background-secondary rounded-xl w-80"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <div className="p-2 border border-dotted rounded-xl">
            {ports && ports.length > 0 ? (
              <Table className="w-full">
                <TableCaption className="text-xs">Internal URLs for this service</TableCaption>
                <TableHeader>
                  <TableRow className="h-8">
                    <TableHead className="w-16 text-xs py-1">Port</TableHead>
                    <TableHead className="text-xs py-1">Internal Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ports.map((port, index) => (
                    <TableRow key={index} className="h-8">
                      <TableCell className="font-medium text-xs py-1">
                        {port.number}
                      </TableCell>
                      <TableCell className="py-1">
                        {port.privateAddress ? (
                          <div className="flex items-center gap-1 min-w-0">
                            <span
                              className="font-mono text-xs bg-muted px-1 py-0.5 rounded cursor-pointer hover:bg-muted/80 transition-colors truncate max-w-48"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                navigator.clipboard.writeText(
                                  port.privateAddress!
                                );
                                toast("Private address copied to clipboard");
                              }}
                              title={port.privateAddress}
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
                          <span className="text-muted-foreground text-xs">N/A</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-xs">No ports available</div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
