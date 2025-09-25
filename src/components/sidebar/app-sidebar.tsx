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
import { CreditCard, Sparkles } from "lucide-react";
import { ProgressCircle } from "@/components/ui/circle-progress";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";

export default function AppSidebar() {
  const { mode } = useAuthState();
  const { k8s } = useTRPCClients();

  // Fetch resource quota data
  const { data: resourceQuota, isLoading: isResourceQuotaLoading } = useQuery(
    k8s.resourceQuota.queryOptions()
  );

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
                    value={75}
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
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Your current subscription plan is{" "}
                      <span className="font-semibold text-foreground">Pro</span>
                      , with an upper limit request counts{" "}
                      <span className="font-semibold text-foreground">
                        1000
                      </span>
                    </p>
                    <Progress value={75} className="h-2" />
                    <p className="text-sm text-muted-foreground">
                      You've used{" "}
                      <span className="font-semibold text-foreground">750</span>{" "}
                      of your quota, click button below to upgrade.
                    </p>
                  </div>
                  <Button
                    className="w-full"
                    size="sm"
                    onClick={openCostCenterApp}
                  >
                    Upgrade
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            {/* )} */}
            {/* {mode === "development" && (
              <UserCard
                user={{
                  name: "John Doe",
                  email: "john.doe@example.com",
                  avatar: "https://github.com/shadcn.png",
                }}
              />
            )} */}
          </div>
        </SidebarFooter>
        {/* <SidebarRail /> */}
      </Sidebar>
    </>
  );
}
