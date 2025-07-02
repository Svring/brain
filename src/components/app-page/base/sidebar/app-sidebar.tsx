"use client";

import { Drama, PanelLeft } from "lucide-react";
import {
  MainSection,
  type NavigationItem,
} from "@/components/app-page/base/sidebar/sidebar-section";
// React and third-party imports
// UI Components
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

// Constants
const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    title: "Drama",
    icon: Drama,
    group: "overview",
    path: "/drama",
  },
];

export default function AppSidebar() {
  const { toggleSidebar } = useSidebar();

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className={cn("bg-background")}>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={toggleSidebar}>
              <PanelLeft className="h-4 w-4" />
              <span>Sealos Brain</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className={cn("bg-background")}>
        <MainSection navigationItems={NAVIGATION_ITEMS} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
