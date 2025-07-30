"use client";

import BaseNode from "../base-node-wrapper";
import { useState } from "react";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { cn } from "@/lib/utils";
import {
  Network,
  Globe,
  Copy,
  CircleQuestionMark,
  MoreHorizontal,
  PencilLine,
  HdmiPort,
  Trash2,
} from "lucide-react";
import useIngressNode from "@/hooks/sealos/ingress/use-ingress-node";
import { createK8sContext } from "@/lib/auth/auth-utils";
import { toast } from "sonner";
import { useInterval } from "@reactuses/core";
import { checkUrl } from "@/lib/sealos/ingress/ingress-method/ingress-utils";
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

export default function IngressNode({
  data: { target },
}: {
  data: {
    target: BuiltinResourceTarget;
  };
}) {
  const k8sContext = createK8sContext();
  const { data, isLoading } = useIngressNode(k8sContext, target);
  const [urlAvailable, setUrlAvailable] = useState(false);

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

  if (isLoading) {
    return null;
  }

  const { layer, host, affiliation, protocol } = data;

  // Construct the URL
  const url = host
    ? `${
        protocol
          ? protocol.toLowerCase() +
            (layer === "application" ? "s" : "") +
            "://"
          : layer === "application"
          ? "https://"
          : ""
      }${host}`
    : null;

  if (!url) {
    return null;
  }

  return (
    <BaseNode
      target={target}
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
              className="rounded-xl bg-background-secondary"
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

        {/* Layer and Host */}
        <div className="flex items-center gap-2 mt-2">
          {urlAvailable ? (
            <Globe
              className={cn(
                "h-4 w-4",
                layer === "application" ? "text-theme-green" : "text-theme-blue"
              )}
            />
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <CircleQuestionMark className="h-4 w-4 text-theme-yellow cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent className="bg-background-secondary">
                  <p>Diagnose with ai</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {host ? (
            <div className="flex items-center gap-1 flex-1 min-w-0">
              {layer === "application" ? (
                <>
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
                      window.open(url!, "_blank");
                    }}
                  >
                    {url}
                  </span>
                  <Copy
                    className="h-4 w-4 hover:text-foreground cursor-pointer transition-colors flex-shrink-0"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigator.clipboard.writeText(url!);
                      toast("URL copied to clipboard");
                    }}
                  />
                </>
              ) : (
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
                    navigator.clipboard.writeText(url!);
                    toast("URL copied to clipboard");
                  }}
                >
                  {url}
                </span>
              )}
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">No host</span>
          )}
        </div>
      </div>
    </BaseNode>
  );
}
