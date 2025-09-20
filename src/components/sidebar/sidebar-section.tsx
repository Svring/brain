import { useRouter, usePathname } from "next/navigation";
import type React from "react";
import { MessageCirclePlus, LayoutGrid } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

// Types
export interface NavigationItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  group: "overview" | "application";
  path: string;
  subItems?: SubNavigationItem[];
}

export interface SubNavigationItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

// Constants
const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    title: "New",
    icon: MessageCirclePlus,
    group: "overview",
    path: "/home",
  },
  {
    title: "Projects",
    icon: LayoutGrid,
    group: "overview",
    path: "/projects",
  },
];

export const MainSection: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (path: string) => {
    // If already on the target path, do nothing
    if (pathname === path) {
      return;
    }
    router.push(path);
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu className="gap-2">
          {NAVIGATION_ITEMS.filter((item) => item.group === "overview").map(
            (item) => {
              const isActive = pathname === item.path;
              const isNewIcon = item.title === "New";

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => handleNavigation(item.path)}
                    isActive={isActive}
                    tooltip={{
                      children: item.title,
                    }}
                    className={cn(
                      isActive
                        ? "outline outline-border-primary bg-muted!"
                        : "",
                      "cursor-pointer"
                    )}
                  >
                    <item.icon />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            }
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
