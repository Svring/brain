"use client";

import { MoreHorizontal, Trash2, Edit2 } from "lucide-react";
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
import { toast } from "sonner";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ProjectObjectSchema } from "@/lib/brain/resources/project/project-schemas/project-object-schema";
import { z } from "zod";
import useProjectResources from "@/hooks/brain/use-project-resources";
import { AvatarCircles } from "@/components/ui/avatar-circles";
import { LAUNCHPAD_ICON } from "@/lib/sealos/resources/launchpad/launchpad-constant/launchpad-constant-icons";
import { OBJECTSTORAGE_ICON } from "@/lib/sealos/resources/objectstorage/objectstorage-constant/objectstorage-constant-icons";
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
  const {
    isOpen: isDropdownOpen,
    onClose: closeDropdown,
    onOpen: openDropdown,
  } = useDisclosure();

  const [isRenameDialogOpen, setIsRenameDialogOpen] = React.useState(false);

  const { resources } = useProjectResources(project.name);

  // console.log("resources", resources);

  // Generate avatar URLs based on resource types
  const { avatarUrls, numPeople } = React.useMemo(() => {
    if (!resources || resources.length === 0)
      return { avatarUrls: [], numPeople: 0 };

    const urls: string[] = [];

    resources.forEach((resource) => {
      const resourceType = resource.resourceType;

      switch (resourceType) {
        case "deployment":
        case "statefulset":
          urls.push(LAUNCHPAD_ICON);
          break;
        case "objectstoragebucket":
          urls.push(OBJECTSTORAGE_ICON);
          break;
        case "devbox":
          urls.push("https://devbox.bja.sealos.run/logo.svg");
          break;
        case "cluster":
          urls.push("https://dbprovider.bja.sealos.run/logo.svg");
          break;
        default:
          // Skip unknown resource types
          break;
      }
    });

    // Remove duplicates and get unique URLs
    const uniqueUrls = [...new Set(urls)];
    const displayedUrls = uniqueUrls.slice(0, 2);
    const remainingCount = uniqueUrls.length - displayedUrls.length + 1;

    return {
      avatarUrls: displayedUrls,
      numPeople: remainingCount > 0 ? remainingCount : 0,
    };
  }, [resources]);

  const deleteProjectMutation = useMutation(
    projectClient.deleteProject.mutationOptions()
  );

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Close the dropdown menu immediately
    closeDropdown();

    deleteProjectMutation.mutate(project.name, {
      onSuccess: (_, name) => {
        queryClient.invalidateQueries({
          queryKey: projectClient.listProjects.queryKey(),
        });
        toast.success(`Project ${name} deleted successfully`);
      },
    });
  };

  const handleRename = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsRenameDialogOpen(true);
    closeDropdown();
  };

  if (variant === "lite") {
    return (
      <>
        <Link
          className="block h-full w-full"
          href={`/projects/${encodeURIComponent(project.name)}`}
        >
          <motion.div
            className={`relative flex h-10 w-full cursor-pointer items-center rounded-lg border bg-background-secondary px-4 text-left shadow-sm hover:brightness-135`}
            transition={{ duration: 0.15, ease: "easeInOut" }}
          >
            <div className="flex-1 min-w-0">
              <h3 className="text-foreground truncate">
                {project.displayName}
              </h3>
            </div>
            {avatarUrls.length > 0 && (
              <div className="ml-2 flex-shrink-0">
                <div className="scale-75 origin-right">
                  <AvatarCircles
                    numPeople={numPeople}
                    avatarUrls={avatarUrls}
                    disableLink={true}
                  />
                </div>
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
      </>
    );
  }

  return (
    <>
      <Link
        className="block h-full w-full"
        href={`/projects/${encodeURIComponent(project.name)}`}
      >
        <motion.div
          className={`relative flex min-h-[160px] w-full cursor-pointer flex-col rounded-lg border bg-background-secondary p-4 text-left shadow-sm ${
            deleteProjectMutation.isPending
              ? "bg-status-deleting/50 border-theme-red"
              : "hover:brightness-135"
          }`}
          transition={{ duration: 0.15, ease: "easeInOut" }}
        >
          {/* Triple dot menu */}
          <div className="absolute top-2 right-2">
            <DropdownMenu
              open={isDropdownOpen}
              onOpenChange={(open) => !open && closeDropdown()}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  className="h-8 w-8 p-0 hover:bg-muted"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openDropdown();
                  }}
                  size="sm"
                  variant="ghost"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="rounded-lg bg-background-secondary"
                align="start"
              >
                <DropdownMenuItem className="rounded-lg" onClick={handleRename}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-theme-red rounded-lg"
                  disabled={deleteProjectMutation.isPending}
                  onClick={handleDelete}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                  {/* {deleteProjectMutation.isPending ? "Deleting..." : "Delete"} */}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <h3 className="text-foreground">{project.displayName}</h3>
          {project.displayName && project.displayName !== project.name && (
            <p className="text-xs text-muted-foreground mb-2">{project.name}</p>
          )}

          {/* Avatar circles in bottom right */}
          <div className="absolute bottom-4 right-4">
            {avatarUrls.length > 0 && (
              <div className="scale-75 origin-right">
                <AvatarCircles
                  numPeople={numPeople}
                  avatarUrls={avatarUrls}
                  disableLink={true}
                />
              </div>
            )}
          </div>
        </motion.div>
      </Link>
      <RenameProjectDialog
        isOpen={isRenameDialogOpen}
        onClose={() => setIsRenameDialogOpen(false)}
        projectName={project.name}
        currentDisplayName={project.displayName}
      />
    </>
  );
};

export default ProjectCard;
