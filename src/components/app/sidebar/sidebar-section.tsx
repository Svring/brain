import { useRouter } from "next/navigation";
import type React from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Types
export interface NavigationItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  group: "overview" | "application";
  path: string;
}

export interface MainSectionProps {
  navigationItems: NavigationItem[];
}

export const MainSection: React.FC<MainSectionProps> = ({
  navigationItems,
}) => {
  const router = useRouter();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {navigationItems
            .filter((item) => item.group === "overview")
            .map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton onClick={() => handleNavigation(item.path)}>
                  <item.icon className="" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
