"use client";

import { Globe } from "lucide-react";
import { useAuthState } from "@/contexts/auth/auth-context";
import { RegionSwitcher } from "@/components/app/sidebar/region-switcher";
import {
  MainSection,
  type NavigationItem,
} from "@/components/app/sidebar/sidebar-section";
import { UserCard } from "@/components/app/sidebar/user-card";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import AIAccess from "./ai-access";

// Constants
const NAVIGATION_ITEMS: NavigationItem[] = [];

export default function AppSidebar() {
  const { auth } = useAuthState();

  return (
    <>
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
          <AIAccess />
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
    </>
  );
}
