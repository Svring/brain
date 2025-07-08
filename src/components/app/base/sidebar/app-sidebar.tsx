"use client";

import { Drama } from "lucide-react";
import { RegionSwitcher } from "@/components/app/base/sidebar/region-switcher";
import {
  MainSection,
  type NavigationItem,
} from "@/components/app/base/sidebar/sidebar-section";
import { UserCard } from "@/components/app/base/sidebar/user-card";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

// Constants
const NAVIGATION_ITEMS: NavigationItem[] = [];

export default function AppSidebar() {
  return (
    <Sidebar className="rounded-lg" collapsible="icon" variant="floating">
      <SidebarHeader className={cn("rounded-t-lg bg-background")}>
        <RegionSwitcher
          regions={[{ name: "sealos", logo: Drama, namespace: "sealos" }]}
        />
      </SidebarHeader>
      <SidebarContent className={cn("rounded-b-lg bg-background")}>
        <MainSection navigationItems={NAVIGATION_ITEMS} />
      </SidebarContent>
      <SidebarFooter className={cn("rounded-b-lg bg-background")}>
        <UserCard
          user={{
            name: "John Doe",
            email: "john.doe@example.com",
            avatar: "https://github.com/shadcn.png",
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
