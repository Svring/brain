"use client";

import { Drama } from "lucide-react";
import { useContext } from "react";
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
import { AuthContext } from "@/contexts/auth-context/auth-context";
import { cn } from "@/lib/utils";

// Constants
const NAVIGATION_ITEMS: NavigationItem[] = [];

export default function AppSidebar() {
  const { user } = useContext(AuthContext);

  return (
    <Sidebar className="rounded-lg" collapsible="icon" variant="floating">
      <SidebarHeader className={cn("rounded-t-lg bg-background")}>
        <RegionSwitcher
          regions={[
            {
              name: user?.regionUrl ?? "",
              logo: Drama,
              namespace: user?.namespace ?? "",
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
            name: "Hydrangea",
            email: "hydrangea@sealos.io",
            avatar: "https://github.com/svring.png",
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
