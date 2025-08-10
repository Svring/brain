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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { listProjectsOptions } from "@/lib/project/project-method/project-query";
import { createK8sContext } from "@/lib/auth/auth-utils";
import { useCopilotChatHeadless_c } from "@copilotkit/react-core";

// Types
export interface NavigationItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  group: "overview" | "application";
  path: string;
}

export interface MainSectionProps {}

// Constants
const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    title: "chat",
    icon: MessageCirclePlus,
    group: "overview",
    path: "/new/chat",
  },
  {
    title: "projects",
    icon: LayoutGrid,
    group: "overview",
    path: "/projects",
  },
];

export const MainSection: React.FC<MainSectionProps> = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { data: projects } = useQuery(listProjectsOptions(createK8sContext()));
  const { reset } = useCopilotChatHeadless_c({ id: "chat" });

  const handleNavigation = (path: string) => {
    console.log("path:", path);
    if (path === "/new/chat" && pathname === "/new/chat") {
      reset();
      console.log("reset chat");
    } else {
      router.push(path);
    }
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
                    {item.title === "projects" && projects?.items ? (
                      <div className="space-y-1">
                        <p className="font-medium">Projects</p>
                        <div className="max-h-48 overflow-y-auto">
                          {projects.items.map((project) => (
                            <div
                              key={project.metadata.name}
                              className="text-sm text-muted-foreground hover:text-foreground cursor-pointer px-2 py-1 rounded hover:bg-accent"
                              onClick={() =>
                                handleNavigation(
                                  `/projects/${project.metadata.name}`
                                )
                              }
                            >
                              {project.metadata.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p>{item.title}</p>
                    )}
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
