"use client";

import { ChevronDown, Trash2, AlertCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { Button } from "@/components/ui/button";
import { RenameProjectDialog } from "@/components/project/rename-project-dialog";
import { useProjectRename } from "@/hooks/brain/use-project-rename";
import { useProjectLifecycle } from "@/hooks/brain/use-project-lifecycle";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import useProjectSearch from "@/hooks/brain/use-projects-search";
import React from "react";

interface FlowgraphHeaderProps {
  projectName: string;
  hasFocusedChat?: boolean;
}

export function FlowgraphBreadcrumb({ projectName, hasFocusedChat = false }: FlowgraphHeaderProps) {
  const router = useRouter();
  const { project } = useTRPCClients();
  const { projects } = useProjectSearch();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const { data: projectData } = useQuery(project.get.queryOptions(projectName));

  const {
    isRenameDialogOpen,
    handleRename,
    handleRenameConfirm,
    handleRenameCancel,
  } = useProjectRename({
    projectName,
    currentDisplayName: projectData?.displayName || projectName,
  });

  const { deleteProject, isDeleting } = useProjectLifecycle({
    shouldRedirect: true, // This will redirect to /projects after deletion
  });

  if (!projectData) {
    return null;
  }

  const projectDisplayName = projectData.displayName;

  const handleProjectSelect = (selectedProjectName: string) => {
    router.push(`/projects/${selectedProjectName}`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    deleteProject(projectName);
    setIsDeleteDialogOpen(false);
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
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
                        onClick={handleDelete}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-3 w-3" />
                        <span className="sr-only">Delete project</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete project</p>
                    </TooltipContent>
                  </Tooltip>
                  {projects &&
                    projects.filter((proj) => proj.name !== projectName)
                      .length > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
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

        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Project</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the project{" "}
                <span className="font-semibold text-foreground">
                  "{projectDisplayName}"
                </span>
                ?
              </AlertDialogDescription>
            </AlertDialogHeader>

            <Alert
              variant="destructive"
              className="bg-status-deleting text-red-700 border-none"
            >
              <AlertCircleIcon />
              <AlertDescription className="text-red-700!">
                This action cannot be undone and will permanently remove the
                project and all its resources.
              </AlertDescription>
            </Alert>

            <AlertDialogFooter>
              <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 bg-status-deleting/80 text-red-700! hover:bg-status-deleting! border border-status-error"
              >
                {isDeleting ? "Deleting..." : "Confirm"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
