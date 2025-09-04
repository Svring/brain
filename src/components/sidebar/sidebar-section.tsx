import { useRouter } from "next/navigation";
import type React from "react";
import { MessageCirclePlus, LayoutGrid } from "lucide-react";
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
  const { reset } = useCopilotChatHeadless_c();

  const handleNavigation = (path: string) => {
    if (path === "/home") {
      reset();
    }
    router.push(path);
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {NAVIGATION_ITEMS.filter((item) => item.group === "overview").map(
            (item) => (
              <SidebarMenuItem key={item.title}>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton
                      onClick={() => handleNavigation(item.path)}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="start">
                    <p>{item.title}</p>
                  </TooltipContent>
                </Tooltip>
              </SidebarMenuItem>
            )
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
