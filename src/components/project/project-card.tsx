"use client";

import {
  Trash2,
  AlertCircleIcon,
  Pencil,
  PencilLine,
  Package,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useProjectLifecycle } from "@/hooks/brain/use-project-lifecycle";
import { useMutation } from "@tanstack/react-query";
import { useInvalidateQueries } from "@/hooks/trpc/use-invalidate-queries";
import { ProjectObjectSchema } from "@/lib/brain/resources/project/project-schemas/project-object-schema";
import { z } from "zod";
import useProjectResources from "@/hooks/brain/use-project-resources";
import { AvatarCircles } from "@/components/ui/avatar-circles";
import { getResourceDefaultIcon } from "@/lib/sealos/sealos-utils";
import { RenameProjectDialog } from "./rename-project-dialog";
import { useProjectRename } from "@/hooks/brain/use-project-rename";
import { useAuthState } from "@/contexts/auth/auth-context";
import { transformDevboxImage } from "@/lib/sealos/resources/devbox/devbox-method/devbox-utils";
import { CLUSTER_TYPE_ICON_MAP } from "@/lib/sealos/resources/cluster/cluster-constant/cluster-constant-icons";

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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const { resources } = useProjectResources(project.name);
  const { auth } = useAuthState();
  const {
    isRenameDialogOpen,
    handleRename,
    handleRenameConfirm,
    handleRenameCancel,
  } = useProjectRename({
    projectName: project.name,
    currentDisplayName: project.displayName,
  });

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
            const runtime = transformDevboxImage(image)
              .split("-")
              .slice(0, -1)
              .join("-");
            return `https://devbox.${auth.regionUrl}/images/runtime/${runtime}.svg`;
          }
        } else if (kind === "cluster") {
          // Get cluster type and use cluster icon map
          const type = resource.spec?.clusterDefinitionRef;
          if (type) {
            return (
              CLUSTER_TYPE_ICON_MAP[type] ||
              "https://dbprovider.bja.sealos.run/logo.svg"
            );
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
              const runtime = transformDevboxImage(image)
                .split("-")
                .slice(0, -1)
                .join("-");
              iconUrl = `https://devbox.${auth.regionUrl}/images/runtime/${runtime}.svg`;
            }
          } else if (kind === "cluster") {
            const type = resource.spec?.clusterDefinitionRef;
            if (type) {
              iconUrl =
                CLUSTER_TYPE_ICON_MAP[type] ||
                "https://dbprovider.bja.sealos.run/logo.svg";
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

  const { deleteProject, isDeleting } = useProjectLifecycle();

  const handleRenameClick = (e: React.MouseEvent) => {
    e.preventDefault();
    handleRename();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    deleteProject(project.name);
    setIsDeleteDialogOpen(false);
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
              ? "h-10 items-center px-4"
              : `min-h-[160px] flex-col p-4 py-3 ${
                  isDeleting ? "bg-status-deleting/50 border-theme-red" : ""
                }`
          }`}
          whileHover={{ y: -5 }}
          transition={{ duration: 0.15, ease: "easeInOut" }}
        >
          <div className="flex items-center justify-between w-full gap-2">
            <div
              className="flex items-center space-x-1 min-w-0 group"
              style={{ maxWidth: "80%" }}
              onClick={variant === "full" ? handleRenameClick : undefined}
            >
              <p
                className={`text-foreground truncate transition-colors ${
                  variant === "full"
                    ? "cursor-pointer hover:text-foreground/80 group-hover:underline"
                    : ""
                }`}
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
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete project</span>
              </Button>
            )}
          </div>
          {variant === "full" && project.displayName !== project.name && (
            <p className="text-xs text-muted-foreground mb-2">{project.name}</p>
          )}

          {avatarData.avatarUrls.length > 0 && (
            <div
              className={`scale-75 origin-right ${
                variant === "lite"
                  ? "ml-auto flex-shrink-0"
                  : "absolute bottom-4 right-4"
              }`}
            >
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
      <RenameProjectDialog
        isOpen={isRenameDialogOpen}
        onClose={handleRenameCancel}
        projectName={project.name}
        currentDisplayName={project.displayName}
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
                "{project.displayName}"
              </span>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <Alert
            variant="destructive"
            className="bg-status-deleting text-red-700 border-none"
          >
            <AlertCircleIcon />
            {/* <AlertTitle>Warning</AlertTitle> */}
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
    </>
  );
};

export default ProjectCard;
