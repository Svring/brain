"use client";

import { Trash2, AlertCircleIcon, PencilLine, Package } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useMutation } from "@tanstack/react-query";
import { useInvalidateQueries } from "@/hooks/trpc/use-invalidate-queries";
import { ProjectObjectSchema } from "@/lib/brain/resources/project/project-schemas/project-object-schema";
import { z } from "zod";
import useProjectResources from "@/hooks/brain/use-project-resources";
import { AvatarCircles } from "@/components/ui/avatar-circles";
import { getResourceDefaultIcon } from "@/lib/sealos/sealos-utils";
import { useProjectRename } from "@/hooks/brain/use-project-rename";
import { useAuthState } from "@/contexts/auth/auth-context";
import { getDevboxRuntimeIconUrl } from "@/lib/sealos/resources/devbox/devbox-method/devbox-utils";
import { getClusterIconUrl } from "@/lib/sealos/resources/cluster/cluster-method/cluster-utils";
import { useProjectLifecycle } from "@/hooks/brain/use-project-lifecycle";

interface ProjectCardProps {
  project: z.infer<typeof ProjectObjectSchema>;
  variant?: "full" | "lite";
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  variant = "full",
}) => {
  const { project: projectClient } = useTRPCClients();
  const { invalidateQueries } = useInvalidateQueries();
  const [showRenameDialog, setShowRenameDialog] = React.useState(false);
  const [renameValue, setRenameValue] = React.useState("");
  const { resources } = useProjectResources(project.name);
  const { auth } = useAuthState();
  const { handleRenameConfirm } = useProjectRename({
    projectName: project.name,
    currentDisplayName: project.displayName,
  });

  const { deleteProject, isDeleting } = useProjectLifecycle({
    shouldRedirect: false,
  });
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [deleteConfirmationValue, setDeleteConfirmationValue] =
    React.useState("");
  const isDeleteConfirmationValid =
    deleteConfirmationValue.trim() === project.displayName;

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteConfirmationValue("");
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!isDeleteConfirmationValid) return;
    try {
      await deleteProject(project.name);
    } finally {
      setShowDeleteDialog(false);
      setDeleteConfirmationValue("");
    }
  };

  const avatarData = React.useMemo(() => {
    if (!resources?.length) return { avatarUrls: [], numPeople: 0 };

    // Group resources by type to prioritize showing different types
    const resourcesByType = resources.reduce((acc, resource) => {
      const kind = resource.kind?.toLowerCase();
      if (!acc[kind]) acc[kind] = [];
      acc[kind].push(resource);
      return acc;
    }, {} as Record<string, any[]>);

    // Generate icons for each resource
    const allIcons = resources
      .map((resource) => {
        const kind = resource.kind?.toLowerCase();

        if (kind === "devbox") {
          // Extract runtime from devbox image and generate icon URL
          const image = resource.spec?.image;
          if (image && auth?.regionUrl) {
            return getDevboxRuntimeIconUrl(image, auth.regionUrl);
          }
        } else if (kind === "cluster") {
          // Get cluster type and use cluster icon function
          const type = resource.spec?.clusterDefinitionRef;
          if (type) {
            return getClusterIconUrl(type);
          }
        } else if (kind === "deployment" || kind === "statefulset") {
          // Use launchpad icon for deployment and statefulset resources
          return "/app_launchpad_icon.svg";
        } else if (kind === "objectstoragebucket") {
          // Use package icon for objectstoragebucket resources
          return "/package_icon.svg";
        }

        // Fallback to default resource icon
        return getResourceDefaultIcon(kind);
      })
      .filter(Boolean) as string[];

    // If we have 3 or more resources, try to show different types
    if (allIcons.length >= 3) {
      const maxDisplayed = 2;
      const selectedIcons: string[] = [];
      const resourceTypes = Object.keys(resourcesByType);

      // First, try to pick one icon from each type
      for (const type of resourceTypes) {
        if (selectedIcons.length >= maxDisplayed) break;

        const typeResources = resourcesByType[type];
        if (typeResources.length > 0) {
          const resource = typeResources[0];
          const kind = resource.kind?.toLowerCase();

          let iconUrl: string | null = null;
          if (kind === "devbox") {
            const image = resource.spec?.image;
            if (image && auth?.regionUrl) {
              iconUrl = getDevboxRuntimeIconUrl(image, auth.regionUrl);
            }
          } else if (kind === "cluster") {
            const type = resource.spec?.clusterDefinitionRef;
            if (type) {
              iconUrl = getClusterIconUrl(type);
            }
          } else if (kind === "deployment" || kind === "statefulset") {
            iconUrl = "/app_launchpad_icon.svg";
          } else if (kind === "objectstoragebucket") {
            // Use package icon for objectstoragebucket resources
            iconUrl = "/package_icon.svg";
          } else {
            iconUrl = getResourceDefaultIcon(kind);
          }

          if (iconUrl) {
            selectedIcons.push(iconUrl);
          }
        }
      }

      // If we still have space and more resources, fill with remaining icons
      if (selectedIcons.length < maxDisplayed) {
        const remainingIcons = allIcons.filter(
          (icon) => !selectedIcons.includes(icon)
        );
        selectedIcons.push(
          ...remainingIcons.slice(0, maxDisplayed - selectedIcons.length)
        );
      }

      return {
        avatarUrls: selectedIcons,
        numPeople: allIcons.length - selectedIcons.length,
      };
    }

    // For less than 3 resources, show all icons
    return {
      avatarUrls: allIcons,
      numPeople: 0,
    };
  }, [resources, auth?.regionUrl]);

  // Validation function based on devbox naming schema
  const validateProjectName = (
    name: string
  ): { isValid: boolean; error?: string } => {
    const trimmedName = name.trim();

    // Check if empty
    if (!trimmedName) {
      return { isValid: false, error: "Project name is required" };
    }

    // Check length (max 63 characters)
    if (trimmedName.length > 63) {
      return {
        isValid: false,
        error: "Project name must be 63 characters or less",
      };
    }

    // Check DNS compliance regex: ^[a-z0-9]([-a-z0-9]*[a-z0-9])?$
    const dnsRegex = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/;
    if (!dnsRegex.test(trimmedName)) {
      return {
        isValid: false,
        error:
          "Project name must be DNS compliant: lowercase, numbers, hyphens only",
      };
    }

    return { isValid: true };
  };

  const handleRenameClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRenameValue(project.displayName);
    setShowRenameDialog(true);
  };

  const handleRenameCancel = () => {
    setShowRenameDialog(false);
    setRenameValue("");
  };

  const handleRenameDialogConfirm = () => {
    const validation = validateProjectName(renameValue);

    if (!validation.isValid) {
      toast.error(validation.error!);
      return;
    }

    if (renameValue.trim() !== project.displayName) {
      handleRenameConfirm(renameValue.trim());
    }
    setShowRenameDialog(false);
    setRenameValue("");
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRenameDialogConfirm();
    } else if (e.key === "Escape") {
      handleRenameCancel();
    }
  };

  const commonLinkProps = {
    href: `/projects/${encodeURIComponent(project.name)}`,
    className: "block h-full w-full",
  };

  return (
    <>
      <Link {...commonLinkProps}>
        <motion.div
          className={`relative flex w-full cursor-pointer rounded-lg border bg-background-secondary text-left shadow-sm ${
            variant === "lite"
              ? "h-10 items-center px-3"
              : `min-h-[160px] flex-col p-4 py-3 ${
                  isDeleting ? "bg-status-deleting/50 border-theme-red" : ""
                }`
          }`}
          whileHover={{ y: -5 }}
          transition={{ duration: 0.15, ease: "easeInOut" }}
        >
          <div className="flex items-center w-full gap-2">
            <div className="flex items-center space-x-1 min-w-0 group flex-1">
              <p
                className={`text-foreground truncate transition-colors ${
                  variant === "full"
                    ? "cursor-pointer hover:text-foreground/80 group-hover:underline"
                    : ""
                }`}
                onClick={variant === "full" ? handleRenameClick : undefined}
              >
                {project.displayName}
              </p>
              {variant === "full" && (
                <Button
                  className="h-4 w-4 p-0 opacity-40 transition-opacity shrink-0"
                  size="sm"
                  variant="ghost"
                  onClick={handleRenameClick}
                >
                  <PencilLine className="h-3 w-3" />
                  <span className="sr-only">Rename project</span>
                </Button>
              )}
            </div>
            {variant === "full" && (
              <Button
                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors shrink-0"
                size="sm"
                variant="ghost"
                onClick={handleDeleteClick}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete project</span>
              </Button>
            )}
            {avatarData.avatarUrls.length > 0 && variant === "lite" && (
              <div className="scale-75 origin-right flex-shrink-0">
                <AvatarCircles
                  numPeople={
                    avatarData.numPeople > 0 ? avatarData.numPeople : undefined
                  }
                  avatarUrls={avatarData.avatarUrls}
                  disableLink
                />
              </div>
            )}
          </div>
          {variant === "full" && project.displayName !== project.name && (
            <p className="text-xs text-muted-foreground mb-2">{project.name}</p>
          )}

          {variant === "full" && (
            <div className="absolute bottom-5 left-4 text-xs text-muted-foreground">
              {new Date(project.createdAt).toLocaleDateString()}
            </div>
          )}

          {avatarData.avatarUrls.length > 0 && variant === "full" && (
            <div className="scale-75 origin-right absolute bottom-4 right-4">
              <AvatarCircles
                numPeople={
                  avatarData.numPeople > 0 ? avatarData.numPeople : undefined
                }
                avatarUrls={avatarData.avatarUrls}
                disableLink
              />
            </div>
          )}
        </motion.div>
      </Link>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
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

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Type the project name{" "}
              <span className="font-semibold text-foreground">
                "{project.displayName}"
              </span>{" "}
              to confirm:
            </p>
            <Input
              value={deleteConfirmationValue}
              onChange={(e) => setDeleteConfirmationValue(e.target.value)}
              placeholder={project.displayName}
              className="w-full"
              autoFocus
            />
            {deleteConfirmationValue && !isDeleteConfirmationValid && (
              <p className="text-sm text-destructive">
                Project name does not match. Please type "{project.displayName}"
                to confirm.
              </p>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting || !isDeleteConfirmationValid}
              className="flex-1 bg-status-deleting/80 text-red-700! hover:bg-status-deleting! border border-status-error disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? "Deleting..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <div className="flex items-center gap-4">
              {/* <label htmlFor="project-name" className="text-sm font-medium">
                Name
              </label> */}
              <Input
                id="project-name"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={handleRenameKeyDown}
                className="flex-1"
                placeholder="Enter project name"
                autoFocus
              />
            </div>
            {renameValue && !validateProjectName(renameValue).isValid && (
              <p className="text-sm text-destructive mt-2">
                {validateProjectName(renameValue).error}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleRenameCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRenameDialogConfirm}
              disabled={!validateProjectName(renameValue).isValid}
              className="flex-1"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProjectCard;
