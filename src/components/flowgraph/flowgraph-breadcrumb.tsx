"use client";

import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { Button } from "@/components/ui/button";
import { RenameProjectDialog } from "@/components/project/rename-project-dialog";
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
import useProjectSearch from "@/hooks/brain/use-projects-search";

interface FlowgraphHeaderProps {
  projectName: string;
}

export function FlowgraphBreadcrumb({ projectName }: FlowgraphHeaderProps) {
  const router = useRouter();
  const { project } = useTRPCClients();
  const { projects } = useProjectSearch();

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

  const handleProjectSelect = (selectedProjectName: string) => {
    router.push(`/projects/${selectedProjectName}`);
  };

  return (
    <div className="absolute top-2 left-2 z-20">
      <div className="bg-background/30 backdrop-blur-lg rounded-lg p-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                onClick={() => router.push("/projects")}
                className="cursor-pointer"
              >
                Projects
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleProjectNameClick}
                  className="font-medium hover:underline cursor-pointer"
                >
                  {projectDisplayName.length > 14
                    ? projectDisplayName.slice(0, 14) + "..."
                    : projectDisplayName}
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
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
              </div>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
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
