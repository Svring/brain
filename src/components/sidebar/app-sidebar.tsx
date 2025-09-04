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
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { BookOpen } from "lucide-react";
import { useAuthState } from "@/contexts/auth/auth-context";

export default function AppSidebar() {
  const { mode } = useAuthState();
  return (
    <>
      <Sidebar className="" collapsible="icon">
        {/* <SidebarHeader className={cn("rounded-t-lg bg-background-secondary")}>
          <RegionSwitcher
            regions={[
              {
                name: auth?.regionUrl ?? "",
                logo: Globe,
                namespace: auth?.namespace ?? "",
              },
            ]}
          />
        </SidebarHeader> */}
        <SidebarContent className={cn("bg-background-primary")}>
          <MainSection />
        </SidebarContent>
        <SidebarFooter className={cn("rounded-b-lg bg-background-primary")}>
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
        <SidebarRail />
      </Sidebar>
    </>
  );
}
