"use client";

import { ArrowLeft, Edit2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MenuBar, MenuBarItem } from "../project/menu-bar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { Button } from "@/components/ui/button";
import { RenameProjectDialog } from "@/components/project/rename-project-dialog";

interface FlowgraphHeaderProps {
  projectName: string;
}

export function FlowgraphHeader({ projectName }: FlowgraphHeaderProps) {
  const router = useRouter();
  const { project } = useTRPCClients();

  const { data: projectData } = useQuery(
    project.getProject.queryOptions(projectName)
  );

  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);

  if (!projectData) {
    return null;
  }

  const projectDisplayName = projectData.displayName;

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsRenameDialogOpen(true);
  };

  const menuItemsLeft: MenuBarItem[] = [
    {
      icon: ArrowLeft,
      label: "Back to Home",
      onClick: () => router.push("/projects"),
      isToggle: false,
    },
  ];

  return (
    <div className="absolute top-2 left-2 z-20">
      <MenuBar activeIndex={null} items={menuItemsLeft}>
        <div className="flex items-center mx-2">
          <div className="flex items-center gap-1">
            <span>
              {projectDisplayName.length > 14
                ? projectDisplayName.slice(0, 14) + "..."
                : projectDisplayName}
            </span>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
              onClick={handleEditClick}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </MenuBar>
      <RenameProjectDialog
        isOpen={isRenameDialogOpen}
        onClose={() => setIsRenameDialogOpen(false)}
        projectName={projectName}
        currentDisplayName={projectDisplayName}
      />
    </div>
  );
}
