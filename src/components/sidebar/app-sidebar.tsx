"use client";

import { MainSection } from "./sidebar-section";
import { UserCard } from "./user-card";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useCopilotContext } from "@copilotkit/react-core";
import { useCreateThreadMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";

export default function AppSidebar() {
  return (
    <>
      <Sidebar className="" collapsible="icon">
        {/* <SidebarHeader className={cn("rounded-t-lg bg-background-secondary")}>
          <RegionSwitcher
            regions={[
              {
                name: auth?.regionUrl ?? "",
                logo: Globe,
                namespace: auth?.namespace ?? "",
              },
            ]}
          />
        </SidebarHeader> */}
        <SidebarContent className={cn("bg-background-primary")}>
          <MainSection />
        </SidebarContent>
        <SidebarFooter className={cn("rounded-b-lg bg-background-primary")}>
          {/* <AIAccess /> */}
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
