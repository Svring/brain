"use client";

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
import Image from "next/image";
import { UserCard } from "./user-card";
import { openCostCenterApp } from "@/lib/auth/auth-utils";
import { CreditCard } from "lucide-react";

export default function AppSidebar() {
  const { mode } = useAuthState();
  return (
    <>
      <Sidebar className="" collapsible="icon">
        <SidebarHeader className={cn("bg-background-primary pt-3")}>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                className="group-data-[collapsible=icon]:justify-center p-0 border-border-primary hover:bg-transparent!"
                size="lg"
                tooltip={{
                  children: "Sealos Brain",
                }}
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg grayscale">
                  <Image
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
            {mode !== "development" && (
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={openCostCenterApp}
                    tooltip={{
                      children: "Cost Center",
                    }}
                    className="cursor-pointer"
                  >
                    <CreditCard className="h-4 w-4" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            )}
            {mode === "development" && (
              <UserCard
                user={{
                  name: "John Doe",
                  email: "john.doe@example.com",
                  avatar: "https://github.com/shadcn.png",
                }}
              />
            )}
          </div>
        </SidebarFooter>
        {/* <SidebarRail /> */}
      </Sidebar>
    </>
  );
}
