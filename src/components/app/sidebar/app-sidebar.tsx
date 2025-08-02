"use client";

import { useAuthState } from "@/contexts/auth/auth-context";
import { RegionSwitcher } from "@/components/app/sidebar/region-switcher";
import { MainSection } from "@/components/app/sidebar/sidebar-section";
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

export default function AppSidebar() {
  const { auth } = useAuthState();

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
        <SidebarFooter className={cn("rounded-b-lg bg-background-secondary")}>
          {/* <AIAccess /> */}
          {/* <UserCard
            user={{
              name: "Brain",
              email: "brain@sealos.io",
              avatar: "https://github.com/vercel.png",
            }}
          /> */}
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </>
  );
}
