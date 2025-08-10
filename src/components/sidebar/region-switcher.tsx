import { ChevronsUpDown, Plus } from "lucide-react";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function RegionSwitcher({
  regions,
}: {
  regions: {
    name: string;
    logo: React.ElementType;
    namespace: string;
  }[];
}) {
  const { isMobile, state } = useSidebar();
  const [activeRegion, setActiveRegion] = React.useState(regions[0]);

  const isCollapsed = state === "collapsed";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              className="group-data-[collapsible=icon]:justify-center"
              size="lg"
              tooltip={{
                children: `${activeRegion.name} (${activeRegion.namespace})`,
              }}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-foreground text-background">
                <activeRegion.logo className="size-4" />
              </div>
              {!isCollapsed && (
                <>
                  <div className="grid flex-1 overflow-hidden text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {activeRegion.name}
                    </span>
                    <span className="truncate text-xs">
                      {activeRegion.namespace}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto" />
                </>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Regions
            </DropdownMenuLabel>
            {regions.map((region, index) => (
              <DropdownMenuItem
                className="gap-2 p-2"
                key={region.name}
                onClick={() => setActiveRegion(region)}
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <region.logo className="size-4 shrink-0" />
                </div>
                {region.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">
                Add region
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
