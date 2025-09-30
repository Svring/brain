"use client";

import React from "react";
import { MainSection } from "./sidebar-section";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { UserCard } from "./user-card";
import { openCostCenterApp } from "@/lib/auth/auth-utils";
import { Sparkles } from "lucide-react";
import { ProgressCircle } from "@/components/ui/circle-progress";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useQuota } from "@/components/provider/quota-provider";
import { useSidebar } from "@/components/ui/sidebar";

export default function AppSidebar() {
  // Use quota provider for all quota-related data and logic
  const { cpu, memory, storage, ports, balance, aiProxy, isLoading } =
    useQuota();

  // Get sidebar state for tooltip visibility
  const { state, isMobile } = useSidebar();

  // Calculate AI proxy usage percentage only
  const aiProxyUsagePercentage = React.useMemo(() => {
    if (!aiProxy) {
      return 0;
    }

    return (aiProxy.used / aiProxy.limit) * 100;
  }, [aiProxy]);


  return (
    <>
      <Sidebar className="" collapsible="icon">
        <SidebarHeader className={cn("bg-background-primary pt-3")}>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                className="group-data-[collapsible=icon]:justify-center p-0 border-border-primary hover:bg-transparent!"
                size="lg"
                // tooltip={{
                //   children: "Sealos Brain",
                // }}
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg grayscale">
                  <img
                    src="/sealos-brain-icon-grayscale.svg"
                    className="grayscale"
                    alt="Sealos Brain"
                    width={32}
                    height={32}
                  />
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        {/* <SidebarSeparator /> */}
        <SidebarContent className={cn("bg-background-primary")}>
          <MainSection />
        </SidebarContent>
        <SidebarFooter className={cn("bg-background-primary")}>
          <div className="flex flex-col gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <div className="cursor-pointer">
                  {state === "collapsed" && !isMobile ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <ProgressCircle
                            value={isLoading ? 0 : aiProxyUsagePercentage}
                            size={32}
                            strokeWidth={2}
                            indicatorClassName="text-primary"
                            trackClassName=""
                          >
                            <Sparkles className="h-4 w-4" />
                          </ProgressCircle>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent
                        align="center"
                        side="right"
                        sideOffset={16}
                      >
                        Quota
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <ProgressCircle
                      value={isLoading ? 0 : aiProxyUsagePercentage}
                      size={32}
                      strokeWidth={2}
                      indicatorClassName="text-primary"
                      trackClassName=""
                    >
                      <Sparkles className="h-4 w-4" />
                    </ProgressCircle>
                  )}
                </div>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                side="right"
                sideOffset={16}
                className="rounded-lg bg-background-secondary border border-border-primary w-80"
              >
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-2 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ) : cpu ? (
                    <div className="space-y-4">
                      {/* Free Quota Usage - Show at the top */}
                      {aiProxy && (
                        <div className="space-y-3 rounded-lg p-4 bg-background-tertiary">
                          <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-foreground">
                                Daily Free Usage
                              </span>
                              <span className="text-xs text-muted-foreground mt-0.5">
                                request counts
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-foreground">
                                {aiProxy.used.toFixed(0)}<span className="text-sm text-muted-foreground">/{aiProxy.limit}</span>
                              </div>
                            </div>
                          </div>
                          <Progress
                            value={aiProxyUsagePercentage}
                            className="h-2"
                          />
                          <div className="text-xs text-muted-foreground text-center font-medium">
                            Resets every 24 hours
                          </div>
                        </div>
                      )}

                      {/* Account Balance - Show remaining balance */}
                      {balance && (
                        <div className="space-y-2 rounded-lg">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">
                              Account Balance
                            </span>
                            <span className="text-foreground font-medium">
                              {(balance.used / 1000000).toFixed(2)} USD
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Resource Quotas - 2x2 Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">CPU</span>
                          <span className="text-primary">
                            {cpu?.used.toFixed(1)}/{cpu?.limit}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Memory</span>
                          <span className="text-primary">
                            {memory?.used.toFixed(1)}/{memory?.limit}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Storage</span>
                          <span className="text-primary">
                            {storage?.used}/{storage?.limit}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Ports</span>
                          <span className="text-primary">
                            {ports?.used}/{ports?.limit}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Resource information is temporarily unavailable.
                      </p>
                    </div>
                  )}
                  <Button
                    className="w-full"
                    size="sm"
                    onClick={() => openCostCenterApp()}
                    disabled={isLoading}
                  >
                    Upgrade
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
