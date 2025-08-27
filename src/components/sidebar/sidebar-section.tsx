import { useRouter, usePathname } from "next/navigation";
import type React from "react";
import {
  MessageCirclePlus,
  LayoutGrid,
  TestTube,
  Plus,
  RefreshCw,
  FileText,
  Table,
} from "lucide-react";
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
import { listProjectsOptions } from "@/lib/brain/resources/project/project-method/project-query";
import { createK8sContext } from "@/lib/auth/auth-utils";

import { useCreateNewChatSessionMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { useAuthState } from "@/contexts/auth/auth-context";

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

export interface MainSectionProps {}

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
  {
    title: "Test",
    icon: TestTube,
    group: "overview",
    path: "/test",
    subItems: [
      {
        title: "Launchpad Create",
        icon: Plus,
        path: "/test/launchpad-create",
      },
      {
        title: "Launchpad Update",
        icon: RefreshCw,
        path: "/test/launchpad-update",
      },
      {
        title: "Project Proposal",
        icon: FileText,
        path: "/test/project-proposal",
      },
      {
        title: "Env Table",
        icon: Table,
        path: "/test/env-table",
      },
      {
        title: "Ports Table",
        icon: Table,
        path: "/test/ports-table",
      },
    ],
  },
];

export const MainSection: React.FC<MainSectionProps> = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { data: projects } = useQuery(listProjectsOptions(createK8sContext()));
  const { auth } = useAuthState();
  const { mutate: createNewChatSession } = useCreateNewChatSessionMutation();

  const handleNavigation = async (path: string) => {
    if (path === "/home") {
      createNewChatSession({
        kubeconfig: auth!.kubeconfig,
      });
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
                    {item.title === "Projects" && projects ? (
                      <div className="space-y-1">
                        <p className="font-medium">Projects</p>
                        <div className="max-h-48 overflow-y-auto">
                          {projects.map((project) => (
                            <div
                              key={project.name}
                              className="text-sm text-muted-foreground hover:text-foreground cursor-pointer px-2 py-1 rounded hover:bg-accent"
                              onClick={() =>
                                router.push(`/projects/${project.name}`)
                              }
                            >
                              {project.displayName}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : item.title === "Test" && item.subItems ? (
                      <div className="space-y-1">
                        <p className="font-medium">Test Pages</p>
                        <div className="max-h-48 overflow-y-auto">
                          {item.subItems.map((subItem) => (
                            <div
                              key={subItem.path}
                              className="text-sm text-muted-foreground hover:text-foreground cursor-pointer px-2 py-1 rounded hover:bg-accent flex items-center gap-2"
                              onClick={() => router.push(subItem.path)}
                            >
                              <subItem.icon className="w-3 h-3" />
                              <div>
                                <div className="font-medium">
                                  {subItem.title}
                                </div>
                              </div>
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
