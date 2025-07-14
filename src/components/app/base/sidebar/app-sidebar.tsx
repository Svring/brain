"use client";

import { Globe } from "lucide-react";
import { useAuthContext } from "@/contexts/auth-context";
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
  const { auth } = useAuthContext();

  return (
    <Sidebar className="rounded-lg" collapsible="icon" variant="floating">
      <SidebarHeader className={cn("rounded-t-lg bg-background")}>
        <RegionSwitcher
          regions={[
            {
              name: auth?.regionUrl ?? "",
              logo: Globe,
              namespace: auth?.namespace ?? "",
            },
          ]}
        />
      </SidebarHeader>
      <SidebarContent className={cn("bg-background")}>
        <MainSection navigationItems={NAVIGATION_ITEMS} />
      </SidebarContent>
      <SidebarFooter className={cn("rounded-b-lg bg-background")}>
        <UserCard
          user={{
            name: "Brain",
            email: "brain@sealos.io",
            avatar: "https://github.com/vercel.png",
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
