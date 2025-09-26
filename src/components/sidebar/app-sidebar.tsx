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
import { useAuthState } from "@/contexts/auth/auth-context";
import { UserCard } from "./user-card";
import { openCostCenterApp } from "@/lib/auth/auth-utils";
import { Sparkles } from "lucide-react";
import { ProgressCircle } from "@/components/ui/circle-progress";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAccountBalance } from "@/hooks/sealos/cost-center/use-account-balance";
// import { usePlanTransaction } from "@/hooks/sealos/cost-center/use-plan-transaction";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";

export default function AppSidebar() {
  const { mode } = useAuthState();
  const { k8s } = useTRPCClients();

  // Fetch account balance and plan transaction data
  const {
    data: accountBalance,
    isLoading: balanceLoading,
    refetch: refetchBalance,
  } = useAccountBalance();
  // const {
  //   data: planTransaction,
  //   isLoading: planLoading,
  //   refetch: refetchPlan,
  // } = usePlanTransaction();

  // console.log("accountBalance", accountBalance);

  // Fetch resource quota data
  const { data: resourceQuota, isLoading: isResourceQuotaLoading } = useQuery(
    k8s.resourceQuota.queryOptions()
  );

  // console.log("resourceQuota", resourceQuota);

  const isLoading = balanceLoading || isResourceQuotaLoading;

  // Calculate overall resource usage percentage and status
  const { overallUsagePercentage, statusColor } = React.useMemo(() => {
    if (!resourceQuota)
      return { overallUsagePercentage: 0, statusColor: "text-primary" };

    const cpuUsage = (resourceQuota.cpu.used / resourceQuota.cpu.limit) * 100;
    const memoryUsage =
      (resourceQuota.memory.used / resourceQuota.memory.limit) * 100;
    const storageUsage =
      (resourceQuota.storage.used / resourceQuota.storage.limit) * 100;
    const portsUsage =
      (resourceQuota.ports.used / resourceQuota.ports.limit) * 100;

    // Check if any resource is at 100% (red)
    const isAtLimit =
      cpuUsage >= 100 ||
      memoryUsage >= 100 ||
      storageUsage >= 100 ||
      portsUsage >= 100;

    // Check if any resource is at 80% or above (yellow)
    const isAtWarning =
      cpuUsage >= 80 ||
      memoryUsage >= 80 ||
      storageUsage >= 80 ||
      portsUsage >= 80;

    // Determine status color
    let statusColor = "text-primary"; // default blue
    if (isAtLimit) {
      statusColor = "text-theme-red"; // red for 100% usage
    } else if (isAtWarning) {
      statusColor = "text-theme-yellow"; // yellow for 80%+ usage
    }

    // Calculate average usage across all resources
    const overallUsagePercentage =
      (cpuUsage + memoryUsage + storageUsage + portsUsage) / 4;

    return { overallUsagePercentage, statusColor };
  }, [resourceQuota]);

  // const transaction = (planTransaction as any)?.transaction;
  // const currentPlan = transaction?.NewPlanName || transaction?.OldPlanName;
  // const planStatus = transaction?.Status;
  // const payStatus = transaction?.PayStatus;

  // const isProPlan = currentPlan === "Pro";
  // const totalQuota = isProPlan ? 1000 : 100;
  // const balance = (accountBalance as any)?.balance || 0;
  // const usedQuota = Math.max(0, totalQuota - Math.floor(balance / 1000000));
  // const usagePercentage = totalQuota > 0 ? (usedQuota / totalQuota) * 100 : 0;

  // const hasValidPlan =
  //   currentPlan && currentPlan !== "00000000-0000-0000-0000-000000000000";
  // const displayPlan = hasValidPlan ? currentPlan : "Free";

  // const handleUpgrade = () => {
  //   openCostCenterApp();
  //   setTimeout(() => {
  //     refetchBalance();
  //     refetchPlan();
  //   }, 5000);
  // };

  // const handleRetry = () => {
  //   refetchBalance();
  //   refetchPlan();
  // };

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
                  <ProgressCircle
                    value={isLoading ? 0 : overallUsagePercentage}
                    size={32}
                    strokeWidth={2}
                    indicatorClassName={statusColor}
                    trackClassName=""
                  >
                    <Sparkles className="h-4 w-4" />
                  </ProgressCircle>
                </div>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                side="right"
                sideOffset={16}
                className="rounded-lg bg-background-tertiary border border-border-primary w-80"
              >
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-2 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ) : resourceQuota ? (
                    <div className="space-y-4">
                      {/* Account Balance - Show remaining balance */}
                      {accountBalance && (
                        <div className="space-y-2 rounded-lg">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">
                              Account Balance
                            </span>
                            <span className="text-foreground font-medium">
                              {(
                                (accountBalance.balance -
                                  accountBalance.deductionBalance) /
                                1000000
                              ).toFixed(2)}{" "}
                              USD
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Resource Quotas - 2x2 Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">CPU</span>
                          <span className={statusColor}>
                            {resourceQuota.cpu.used.toFixed(1)}/
                            {resourceQuota.cpu.limit}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Memory</span>
                          <span className={statusColor}>
                            {resourceQuota.memory.used.toFixed(1)}/
                            {resourceQuota.memory.limit}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Storage</span>
                          <span className={statusColor}>
                            {resourceQuota.storage.used}/
                            {resourceQuota.storage.limit}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Ports</span>
                          <span className={statusColor}>
                            {resourceQuota.ports.used}/
                            {resourceQuota.ports.limit}
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
