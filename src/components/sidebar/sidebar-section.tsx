import { useRouter, usePathname } from "next/navigation";
import type React from "react";
import { MessageCirclePlus, LayoutGrid, Plus } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCopilotChatHeadless_c } from "@copilotkit/react-core";

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
    icon: Plus,
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
  const { setMessages } = useCopilotChatHeadless_c();

  const handleNavigation = (path: string) => {
    if (path === "/home") {
      setMessages([]);
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
                    className={
                      isActive
                        ? "outline outline-border-primary bg-foreground/90! text-background!"
                        : ""
                    }
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
