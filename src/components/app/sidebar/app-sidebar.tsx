"use client";

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
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/") {
    router.push("/new/chat");
  }

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
