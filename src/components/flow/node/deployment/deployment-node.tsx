"use client";

import BaseNode from "../base-node-wrapper";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import Image from "next/image";
import { createK8sContext } from "@/lib/auth/auth-utils";
import useDeploymentNode from "@/hooks/sealos/deployment/use-deployment-node";
import {
  GlobeLock,
  Activity,
  Package,
  Square,
  MoreHorizontal,
  Pause,
  RotateCcw,
  Trash2,
  PencilLine,
  Copy,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

export default function DeploymentNode({
  data: { target },
}: {
  data: { target: BuiltinResourceTarget };
}) {
  const { data, isLoading } = useDeploymentNode(createK8sContext(), target);

  if (isLoading || !data) {
    return null;
  }

  const { name, image, status, ports } = data;

  return (
    <BaseNode target={target} nodeData={data}>
      <div className="flex h-full flex-col gap-2 justify-between">
        {/* Header with Name and Dropdown */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 truncate font-medium">
            <div className="flex flex-col items-start">
              <span className="flex items-center gap-4">
                <Image
                  src="https://applaunchpad.bja.sealos.run/logo.svg"
                  alt="Deploy Icon"
                  width={24}
                  height={24}
                  className="rounded-lg border border-muted h-9 w-9"
                  priority
                />
                <span className="flex flex-col">
                  <span className="text-xs text-muted-foreground leading-none">
                    App Launchpad
                  </span>
                  <span className="text-lg font-bold text-foreground leading-tight w-50 overflow-hidden text-ellipsis text-left">
                    {name}
                  </span>
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
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </DropdownMenuItem>
              <DropdownMenuItem>
                <PencilLine className="mr-2 h-4 w-4" />
                Update
              </DropdownMenuItem>
              <DropdownMenuItem>
                <RotateCcw className="mr-2 h-4 w-4" />
                Restart
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Image with Package Icon */}
        <div className="flex items-center gap-2 mt-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <div className="text-sm text-muted-foreground truncate flex-1">
            Image: {image}
          </div>
        </div>

        {/* Bottom section with status and icons */}
        <div className="mt-auto flex justify-between items-center">
          {/* Left: Square icon with status */}
          <div className="flex items-center justify-center gap-2">
            <Square
              className={`h-3 w-3 ${
                status.unavailableReplicas !== undefined &&
                status.unavailableReplicas > 0
                  ? "fill-theme-red text-theme-red"
                  : "fill-theme-green text-theme-green"
              }`}
            />
            <span className="text-sm text-center">
              {status.unavailableReplicas !== undefined &&
              status.unavailableReplicas > 0
                ? "error"
                : "running"}
            </span>
          </div>

          {/* Right: GlobeLock and Activity icons */}
          <div className="flex items-center gap-2">
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
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
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
            <div className="p-1 border-2 border-muted-foreground/20 rounded-full">
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
    </BaseNode>
  );
}
