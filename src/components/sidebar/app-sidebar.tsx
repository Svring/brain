"use client";

import { MainSection } from "./sidebar-section";
import { UserCard } from "./user-card";
import { BrainTokenStats } from "./brain-token-stats";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { BookOpen } from "lucide-react";
import { useAuthState } from "@/contexts/auth/auth-context";
import Image from "next/image";

export default function AppSidebar() {
  const { mode } = useAuthState();
  return (
    <>
      <Sidebar className="" collapsible="icon">
        <SidebarHeader
          className={cn("bg-background-primary")}
        >
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                className="group-data-[collapsible=icon]:justify-center p-0 border-border-primary"
                size="lg"
                tooltip={{
                  children: "Sealos Brain",
                }}
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Image
                    src="/sealos-brain-icon.svg"
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
          {/* <AIAccess /> */}
          {mode === "production" ? (
            <BrainTokenStats />
          ) : (
            <UserCard
              user={{
                name: "Brain",
                email: "brain@sealos.io",
                avatar: "https://github.com/vercel.png",
              }}
            />
          )}
          {/* <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <BookOpen />
                <span>Documentation</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu> */}
        </SidebarFooter>
        {/* <SidebarRail /> */}
      </Sidebar>
    </>
  );
}
