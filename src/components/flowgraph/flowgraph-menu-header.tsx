"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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

  const handleProjectNameClick = () => {
    setIsRenameDialogOpen(true);
  };

  return (
    <div className="absolute top-2 left-2 z-20">
      <div className="flex items-center gap-2 bg-background/30 backdrop-blur-lg rounded-lg p-2">
        <Button
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={() => router.push("/projects")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <button
          onClick={handleProjectNameClick}
          className="font-medium hover:underline cursor-pointer text-lg"
        >
          {projectDisplayName.length > 14
            ? projectDisplayName.slice(0, 14) + "..."
            : projectDisplayName}
        </button>
      </div>
      <RenameProjectDialog
        isOpen={isRenameDialogOpen}
        onClose={() => setIsRenameDialogOpen(false)}
        projectName={projectName}
        currentDisplayName={projectDisplayName}
      />
    </div>
  );
}
