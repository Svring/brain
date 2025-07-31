"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
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
  ArrowBigUpDash,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { DEVBOX_IDE } from "@/lib/sealos/devbox/devbox-constant";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { composeSshConnectionUri } from "@/lib/sealos/devbox/devbox-method/devbox-utils";
import { getDevboxSshInfo } from "@/lib/sealos/devbox/devbox-method/devbox-query";
import BaseNode from "../base-node-wrapper";
import useDevboxNode from "@/hooks/sealos/devbox/use-devbox-node";
import { createK8sContext } from "@/lib/auth/auth-utils";
import { createDevboxContext } from "@/lib/sealos/devbox/devbox-method/devbox-utils";
import _ from "lodash";

export default function DevboxNode({
  data: { target },
}: {
  data: { target: CustomResourceTarget };
}) {
  const context = createK8sContext();
  const devboxContext = createDevboxContext();
  const { data, isLoading } = useDevboxNode(context, target);
  const [selectedIde, setSelectedIde] = useState<string>("vscode");

  if (isLoading || !data) {
    return null;
  }

  const { name, image, status, ports } = data;

  console.log(data);

  return (
    <BaseNode target={target} nodeData={data}>
      <div className="flex h-full flex-col gap-2 justify-between">
        {/* Header with Name and Dropdown */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 truncate font-medium flex-1 min-w-0">
            <div className="flex flex-col items-start">
              <span className="flex items-center gap-4">
                <Image
                  src={`https://devbox.${context.regionUrl}/images/runtime/${
                    image.split("-")[0]
                  }.svg`}
                  alt="Devbox Icon"
                  width={24}
                  height={24}
                  className="rounded-lg h-9 w-9 flex-shrink-0"
                  priority
                />
                <span className="flex flex-col min-w-0">
                  <span className="text-xs text-muted-foreground leading-none">
                    Devbox
                  </span>
                  <span className="text-lg font-bold text-foreground leading-tight truncate">
                    {name.length > 8 ? `${name.slice(0, 8)}...` : name}
                  </span>
                </span>
              </span>
            </div>
          </div>

          {/* IDE Selector and Dropdown Menu */}
          <div className="flex flex-row items-center gap-2 flex-shrink-0">
            {/* IDE Selector Dropdown */}
            <div className="flex items-center border border-border rounded-lg overflow-hidden ">
              {/* IDE Icon - Click to log IDE */}
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    // Fetch SSH info dynamically
                    const token = await getDevboxSshInfo(devboxContext, target);

                    if (data.ssh) {
                      const sshUri = composeSshConnectionUri(
                        selectedIde,
                        context,
                        data.ssh,
                        data.name,
                        token
                      );
                      window.open(sshUri, "_blank");
                    }
                  } catch (error) {
                    console.error("Failed to get SSH info:", error);
                  }
                }}
                className="p-1 hover:bg-muted transition-colors flex items-center"
              >
                <Image
                  src={`https://devbox.${context.regionUrl}/images/ide/${selectedIde}.svg`}
                  alt={`${selectedIde} icon`}
                  width={16}
                  height={16}
                  className="h-5 w-6"
                />
              </button>

              {/* Separator */}
              <div className="w-px h-4 bg-border" />

              {/* Dropdown Arrow */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="p-1 hover:bg-muted transition-colors flex items-center"
                  >
                    <ChevronDown className="h-5 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="rounded-xl bg-background-secondary"
                  align="start"
                >
                  {DEVBOX_IDE.map((ide) => (
                    <DropdownMenuItem
                      key={ide}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedIde(ide);
                      }}
                      className={selectedIde === ide ? "bg-muted" : ""}
                    >
                      <Image
                        src={`https://devbox.${context.regionUrl}/images/ide/${ide}.svg`}
                        alt={`${ide} icon`}
                        width={16}
                        height={16}
                        className="mr-2 h-4 w-4"
                      />
                      <span className="capitalize">{ide}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Actions Dropdown Menu */}
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
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
                status === "Running"
                  ? "fill-theme-green text-theme-green"
                  : status === "Stopped"
                  ? "fill-theme-purple text-theme-purple"
                  : status === "Pending"
                  ? "fill-theme-gray text-theme-gray"
                  : status === "Shutdown"
                  ? "fill-theme-purple text-theme-purple"
                  : status === "Error"
                  ? "fill-theme-red text-theme-red"
                  : "fill-theme-gray text-theme-gray"
              }`}
            />
            <span className="text-sm text-center">{status}</span>
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
            <div className="p-1 border-2 border-muted-foreground/20 rounded-full">
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Release Button */}
        <div className="">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              // Add release functionality here
            }}
            size="sm"
            variant="ghost"
            className="w-full border cursor-pointer"
          >
            <ArrowBigUpDash className="h-4 w-4" />
            Release
          </Button>
        </div>
      </div>
    </BaseNode>
  );
}
