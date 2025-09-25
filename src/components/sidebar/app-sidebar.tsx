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
import { usePlanTransaction } from "@/hooks/sealos/cost-center/use-plan-transaction";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";

export default function AppSidebar() {
  const { mode } = useAuthState();
  const { k8s } = useTRPCClients();

  // Fetch account balance and plan transaction data
  const { data: accountBalance, isLoading: balanceLoading, refetch: refetchBalance } = useAccountBalance();
  const { data: planTransaction, isLoading: planLoading, refetch: refetchPlan } = usePlanTransaction();
  
  // Fetch resource quota data
  const { data: resourceQuota, isLoading: isResourceQuotaLoading } = useQuery(
    k8s.resourceQuota.queryOptions()
  );

  const isLoading = balanceLoading || planLoading || isResourceQuotaLoading;

  const transaction = (planTransaction as any)?.transaction;
  const currentPlan = transaction?.NewPlanName || transaction?.OldPlanName;
  const planStatus = transaction?.Status;
  const payStatus = transaction?.PayStatus;

  const isProPlan = currentPlan === "Pro";
  const totalQuota = isProPlan ? 1000 : 100;
  const balance = (accountBalance as any)?.balance || 0;
  const usedQuota = Math.max(0, totalQuota - Math.floor(balance / 1000000));
  const usagePercentage = totalQuota > 0 ? (usedQuota / totalQuota) * 100 : 0;

  const hasValidPlan = currentPlan && currentPlan !== "00000000-0000-0000-0000-000000000000";
  const displayPlan = hasValidPlan ? currentPlan : "Free";

  const handleUpgrade = () => {
    openCostCenterApp();
    setTimeout(() => {
      refetchBalance();
      refetchPlan();
    }, 5000);
  };

  const handleRetry = () => {
    refetchBalance();
    refetchPlan();
  };

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
                    value={isLoading ? 0 : usagePercentage}
                    size={32}
                    strokeWidth={2}
                    indicatorClassName="text-primary"
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
                className="rounded-lg bg-background-tertiary border border-border-primary"
              >
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-2 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ) : !accountBalance ? (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Unable to load subscription information. Please try again later.
                      </p>
                      <Button variant="outline" size="sm" onClick={handleRetry} className="w-full">
                        Retry
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Your current subscription plan is{" "}
                        <span className="font-semibold text-foreground">{displayPlan}</span>
                        , with an upper limit request counts{" "}
                        <span className="font-semibold text-foreground">{totalQuota}</span>
                      </p>
                      <Progress value={usagePercentage} className="h-2" />
                      <p className="text-sm text-muted-foreground">
                        You've used{" "}
                        <span className="font-semibold text-foreground">{usedQuota}</span>{" "}
                        of your quota, click button below to upgrade.
                      </p>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>Balance: {(balance / 1000000).toFixed(2)} credits</div>
                        {planStatus && planStatus !== "00000000-0000-0000-0000-000000000000" && (
                          <div>Plan Status: {planStatus}</div>
                        )}
                        {payStatus && payStatus !== "00000000-0000-0000-0000-000000000000" && (
                          <div>Payment Status: {payStatus}</div>
                        )}
                      </div>
                    </div>
                  )}
                  <Button
                    className="w-full"
                    size="sm"
                    onClick={handleUpgrade}
                    disabled={isLoading}
                  >
                    {isProPlan ? "Manage Plan" : "Upgrade"}
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
