"use client";

import { MoreHorizontal, Trash2, Edit2, AlertCircleIcon } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import React from "react";
import { useDisclosure } from "@reactuses/core";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ProjectObjectSchema } from "@/lib/brain/resources/project/project-schemas/project-object-schema";
import { z } from "zod";
import useProjectResources from "@/hooks/brain/use-project-resources";
import { AvatarCircles } from "@/components/ui/avatar-circles";
import { getResourceDefaultIcon } from "@/lib/sealos/sealos-utils";
import { RenameProjectDialog } from "./rename-project-dialog";

interface ProjectCardProps {
  project: z.infer<typeof ProjectObjectSchema>;
  variant?: "full" | "lite";
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  variant = "full",
}) => {
  const { project: projectClient } = useTRPCClients();
  const queryClient = useQueryClient();
  const { isOpen: isDropdownOpen, onOpenChange } = useDisclosure();
  const [isRenameDialogOpen, setIsRenameDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const { resources } = useProjectResources(project.name);

  const avatarData = React.useMemo(() => {
    if (!resources?.length) return { avatarUrls: [], numPeople: 0 };
    const avatarUrls = resources
      .map((r) => getResourceDefaultIcon(r.resourceType))
      .filter(Boolean) as string[];
    const maxDisplayed = avatarUrls.length > 2 ? 2 : 1;
    return {
      avatarUrls: avatarUrls.slice(0, maxDisplayed),
      numPeople: avatarUrls.length - maxDisplayed,
    };
  }, [resources]);

  const { mutate: deleteProject, isPending: isDeleting } = useMutation({
    ...projectClient.deleteProject.mutationOptions(),
    onSuccess: (_, name) => {
      queryClient.invalidateQueries({
        queryKey: projectClient.listProjects.queryKey(),
      });
      toast.success(`Project ${name} deleted successfully`);
    },
  });

  const handleAction = (e: React.MouseEvent, action: "delete" | "rename") => {
    e.preventDefault();
    e.stopPropagation();
    onOpenChange();
    action === "rename"
      ? setIsRenameDialogOpen(true)
      : setIsDeleteDialogOpen(true);
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
          className={`relative flex w-full cursor-pointer rounded-lg border bg-background-secondary text-left shadow-sm hover:brightness-135 ${
            variant === "lite"
              ? "h-10 items-center px-4"
              : `min-h-[160px] flex-col p-4 ${
                  isDeleting ? "bg-status-deleting/50 border-theme-red" : ""
                }`
          }`}
          transition={{ duration: 0.15, ease: "easeInOut" }}
        >
          {variant === "full" && (
            <DropdownMenu open={isDropdownOpen} onOpenChange={onOpenChange}>
              <DropdownMenuTrigger asChild>
                <Button
                  className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-muted"
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onOpenChange();
                  }}
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="rounded-lg bg-background-secondary"
                align="start"
              >
                <DropdownMenuItem onClick={(e) => handleAction(e, "rename")}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-theme-red"
                  disabled={isDeleting}
                  onClick={(e) => handleAction(e, "delete")}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <h3 className="text-foreground truncate">{project.displayName}</h3>
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
                numPeople={avatarData.numPeople}
                avatarUrls={avatarData.avatarUrls}
                disableLink
              />
            </div>
          )}
        </motion.div>
      </Link>
      <RenameProjectDialog
        isOpen={isRenameDialogOpen}
        onClose={() => setIsRenameDialogOpen(false)}
        projectName={project.name}
        currentDisplayName={project.displayName}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the project "{project.displayName}
              "?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <Alert
            variant="destructive"
            className="bg-status-deleting/80 text-status-error border-none"
          >
            <AlertCircleIcon />
            {/* <AlertTitle>Warning</AlertTitle> */}
            <AlertDescription>
              This action cannot be undone and will permanently remove the
              project and all its resources.
            </AlertDescription>
          </Alert>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-status-deleting/80 text-status-error border border-status-error"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProjectCard;
