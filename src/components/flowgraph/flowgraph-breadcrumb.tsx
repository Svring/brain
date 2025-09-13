"use client";

import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { Button } from "@/components/ui/button";
import { RenameProjectDialog } from "@/components/project/rename-project-dialog";
import { useProjectRename } from "@/hooks/brain/use-project-rename";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useProjectSearch from "@/hooks/brain/use-projects-search";

interface FlowgraphHeaderProps {
  projectName: string;
}

export function FlowgraphBreadcrumb({ projectName }: FlowgraphHeaderProps) {
  const router = useRouter();
  const { project } = useTRPCClients();
  const { projects } = useProjectSearch();

  const { data: projectData } = useQuery(
    project.get.queryOptions(projectName)
  );

  const { isRenameDialogOpen, handleRename, handleRenameConfirm, handleRenameCancel } = useProjectRename({
    projectName,
    currentDisplayName: projectData?.displayName || projectName,
  });

  if (!projectData) {
    return null;
  }

  const projectDisplayName = projectData.displayName;

  const handleProjectSelect = (selectedProjectName: string) => {
    router.push(`/projects/${selectedProjectName}`);
  };

  return (
    <TooltipProvider>
      <div className="absolute top-2 left-2 z-20">
        <div className="bg-background/30 backdrop-blur-lg rounded-lg p-2">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <BreadcrumbLink
                      onClick={() => router.push("/projects")}
                      className="cursor-pointer"
                    >
                      Projects
                    </BreadcrumbLink>
                  </TooltipTrigger>
                  <TooltipContent align="start">
                    <p>Back to projects</p>
                  </TooltipContent>
                </Tooltip>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleRename}
                        className="font-medium hover:underline cursor-pointer"
                      >
                        {projectDisplayName.length > 14
                          ? projectDisplayName.slice(0, 14) + "..."
                          : projectDisplayName}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Rename</p>
                    </TooltipContent>
                  </Tooltip>
                  {projects && projects.filter((proj) => proj.name !== projectName).length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="">
                        {projects
                          ?.filter((proj) => proj.name !== projectName)
                          .map((proj) => (
                            <DropdownMenuItem
                              key={proj.name}
                              onClick={() => handleProjectSelect(proj.name)}
                            >
                              {proj.displayName || proj.name}
                            </DropdownMenuItem>
                          ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <RenameProjectDialog
          isOpen={isRenameDialogOpen}
          onClose={handleRenameCancel}
          projectName={projectName}
          currentDisplayName={projectDisplayName}
          onConfirm={handleRenameConfirm}
          onCancel={handleRenameCancel}
        />
      </div>
    </TooltipProvider>
  );
}
