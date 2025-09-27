"use client";

import { ChevronDown, Trash2, AlertCircleIcon, X, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { toast } from "sonner";
import React from "react";

interface FlowgraphHeaderProps {
  projectName: string;
  hasFocusedChat?: boolean;
}

export function FlowgraphBreadcrumb({
  projectName,
  hasFocusedChat = false,
}: FlowgraphHeaderProps) {
  const router = useRouter();
  const { project } = useTRPCClients();
  const { projects } = useProjectSearch();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState("");

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

  // Validation function based on devbox naming schema
  const validateProjectName = (name: string): { isValid: boolean; error?: string } => {
    const trimmedName = name.trim();
    
    // Check if empty
    if (!trimmedName) {
      return { isValid: false, error: "Project name is required" };
    }
    
    // Check length (max 63 characters)
    if (trimmedName.length > 63) {
      return { isValid: false, error: "Project name must be 63 characters or less" };
    }
    
    // Check DNS compliance regex: ^[a-z0-9]([-a-z0-9]*[a-z0-9])?$
    const dnsRegex = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/;
    if (!dnsRegex.test(trimmedName)) {
      return { 
        isValid: false, 
        error: "Project name must be DNS compliant: lowercase, numbers, hyphens only" 
      };
    }
    
    return { isValid: true };
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditValue(projectDisplayName);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditValue("");
  };

  const handleConfirmEdit = () => {
    const validation = validateProjectName(editValue);
    
    if (!validation.isValid) {
      toast.error(validation.error!);
      return; // Don't exit editing mode, let user fix the input
    }
    
    if (editValue.trim() !== projectDisplayName) {
      handleRenameConfirm(editValue.trim());
    }
    setIsEditing(false);
    setEditValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleConfirmEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
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
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="h-6 px-2 text-sm font-medium min-w-0 max-w-48"
                        autoFocus
                        onBlur={() => {
                          // Small delay to allow button clicks to register before validation
                          setTimeout(handleConfirmEdit, 100);
                        }}
                      />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-green-100 hover:text-green-600 text-muted-foreground transition-colors"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleConfirmEdit();
                            }}
                          >
                            <Check className="h-3 w-3" />
                            <span className="sr-only">Confirm rename</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Confirm</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600 text-muted-foreground transition-colors"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleCancelEdit();
                            }}
                          >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Cancel rename</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Cancel</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  ) : (
                    <>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={handleStartEdit}
                            className="font-medium hover:underline cursor-pointer"
                          >
                            {projectDisplayName.length > 14
                              ? projectDisplayName.slice(0, 14) + "..."
                              : projectDisplayName}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Click to rename</p>
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
                    </>
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
