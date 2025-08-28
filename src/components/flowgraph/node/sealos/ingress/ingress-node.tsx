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
import { useCopilotChatHeadless_c } from "@copilotkit/react-core";
import { useChatActions } from "@/contexts/chat/chat-context";

interface IngressObject {
  number: number;
  name: string;
  nodePort: number;
  protocol: "TCP" | "UDP" | "HTTP" | "GRPC" | "WS";
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
  const [urlAvailable, setUrlAvailable] = useState(true);

  // console.log("ingress node", object);
  // console.log("object", object);
  // console.log("parent", data.parent);

  // Use public address if available, otherwise fall back to private address
  const { publicAddress, privateAddress, protocol } = object;
  const displayAddress = publicAddress || privateAddress;
  const url = displayAddress;
  const hasPublicAddress = !!publicAddress;
  const shouldCheckUrl = hasPublicAddress && protocol === "HTTP";

  // useInterval(
  //   async () => {
  //     if (!url || !shouldCheckUrl) {
  //       return;
  //     }
  //     const result = await checkUrl(url);
  //     setUrlAvailable(result.available);
  //   },
  //   url && shouldCheckUrl ? 5000 : null,
  // );

  return (
    <BaseNode
      nodeId={data}
      className={cn(
        "p-4 h-27",
        shouldCheckUrl && !urlAvailable && "bg-theme-yellow/10"
      )}
    >
      <div className="flex h-full flex-col justify-between">
        {/* Header with Name and Dropdown */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 truncate font-medium">
            <div className="flex flex-col items-start">
              <span className="flex items-center gap-4">
                <Network className="rounded-lg h-9 w-9 p-1.5 bg-muted" />
                <span className="flex flex-col">
                  <span className="text-lg leading-none">Network</span>
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

        {/* Status and Address Display */}
        <div className="flex items-center gap-2 mt-2">
          {shouldCheckUrl ? (
            urlAvailable ? (
              <Globe className="h-4 w-4 text-theme-green" />
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle
                      className="h-4 w-4 text-theme-yellow cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    />
                  </TooltipTrigger>
                  <TooltipContent className="">
                    <p>Diagnose with ai</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )
          ) : (
            <Globe className="h-4 w-4 text-theme-blue" />
          )}

          <div className="flex justify-between items-center gap-1 flex-1 min-w-0">
            <span
              className={cn(
                "text-sm truncate transition-colors",
                shouldCheckUrl
                  ? "text-foreground cursor-pointer hover:text-foreground"
                  : "text-muted-foreground cursor-not-allowed"
              )}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (shouldCheckUrl) {
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
