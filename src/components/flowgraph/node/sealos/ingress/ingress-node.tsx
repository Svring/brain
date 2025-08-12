"use client";

import BaseNode from "../../base-node-wrapper";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Network,
  Globe,
  Copy,
  HelpCircle,
  MoreHorizontal,
  PencilLine,
  HdmiPort,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useInterval } from "@reactuses/core";
import { checkUrl } from "@/lib/sealos/resources/ingress/ingress-method/ingress-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface IngressObject {
  number: number;
  name: string;
  nodePort: number;
  protocol: string;
  serviceName: string;
  privateAddress: string;
  publicAddress: string;
}

export default function IngressNode({
  data,
}: {
  data: {
    object: IngressObject;
    parent: any;
  };
}) {
  const { object } = data;
  const [urlAvailable, setUrlAvailable] = useState(false);

  // Use public address if available, otherwise fall back to private address
  const displayAddress = object.publicAddress || object.privateAddress;
  const url = displayAddress;

  useInterval(
    async () => {
      if (!url) {
        return;
      }
      const result = await checkUrl(url);
      setUrlAvailable(result.available);
    },
    20000,
    { immediate: true }
  );

  return (
    <BaseNode
      nodeData={data}
      className={cn("p-4 h-27", !urlAvailable && "bg-theme-yellow/10")}
    >
      <div className="flex h-full flex-col justify-between">
        {/* Header with Name and Dropdown */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 truncate font-medium">
            <div className="flex flex-col items-start">
              <span className="flex items-center gap-4">
                <Network className="rounded-lg h-9 w-9 p-1.5 bg-muted" />
                <span className="flex flex-col">
                  <span className="text-lg leading-none">Ingress</span>
                </span>
              </span>
            </div>
          </div>

          {/* Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="p-1 hover:bg-muted rounded transition-colors"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="rounded-lg bg-background-secondary"
              align="start"
            >
              <DropdownMenuItem>
                <HdmiPort className="mr-2 h-4 w-4" />
                Update Port
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Globe className="mr-2 h-4 w-4" />
                Custom Domain
              </DropdownMenuItem>
              <DropdownMenuItem>
                <PencilLine className="mr-2 h-4 w-4" />
                Update Type
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Service and Port Information */}
        {/* <div className="flex items-center gap-2 mt-2">
          {urlAvailable ? (
            <Globe
              className={cn(
                "h-4 w-4",
                object.protocol === "TCP" ? "text-theme-blue" : "text-theme-green"
              )}
            />
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-theme-yellow cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent className="bg-background-secondary">
                  <p>Diagnose with ai</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <span className="text-sm text-muted-foreground">
              {object.serviceName}:{object.number}
            </span>
            <span className="text-xs text-muted-foreground">
              (NodePort: {object.nodePort})
            </span>
          </div>
        </div> */}

        {/* Address Display */}
        <div className="flex items-center gap-2 mt-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <span
              className={cn(
                "text-sm truncate transition-colors",
                urlAvailable
                  ? "text-foreground cursor-pointer hover:text-foreground"
                  : "text-muted-foreground cursor-not-allowed"
              )}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (urlAvailable) {
                  window.open(url, "_blank");
                }
              }}
            >
              {displayAddress}
            </span>
            <Copy
              className="h-4 w-4 hover:text-foreground cursor-pointer transition-colors flex-shrink-0"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigator.clipboard.writeText(displayAddress);
                toast("Address copied to clipboard");
              }}
            />
          </div>
        </div>
      </div>
    </BaseNode>
  );
}
