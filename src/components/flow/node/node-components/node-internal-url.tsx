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

interface Port {
  number: number;
  privateAddress?: string;
}

interface NodeInternalUrlProps {
  ports?: Port[];
}

export default function NodeInternalUrl({ ports }: NodeInternalUrlProps) {
  return (
    <TooltipProvider>
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
          <div className="space-y-2 p-2">
            {ports && ports.length > 0 ? (
              ports.map((port, index) => (
                <div key={index} className="text-sm space-y-1">
                  <div className="font-medium">Port: {port.number}</div>
                  {port.privateAddress && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        Private:
                      </span>
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
                  )}
                </div>
              ))
            ) : (
              <div className="text-sm">No ports available</div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}