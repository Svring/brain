"use client";

import { MoreHorizontal, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import type React from "react";
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

interface ProjectCardProps {
  project: z.infer<typeof ProjectObjectSchema>;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const { project: projectClient } = useTRPCClients();
  const queryClient = useQueryClient();
  const {
    isOpen: isDropdownOpen,
    onClose: closeDropdown,
    onOpen: openDropdown,
  } = useDisclosure();

  const { resources } = useProjectResources(project.name);

  // console.log("resources", resources);

  const deleteProjectMutation = useMutation(
    projectClient.deleteProject.mutationOptions({
      onSuccess: (_, name) => {
        queryClient.invalidateQueries({
          queryKey: projectClient.listProjects.queryKey(),
        });
        toast.success(`Project ${name} deleted successfully`);
      },
    })
  );

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Close the dropdown menu immediately
    closeDropdown();

    deleteProjectMutation.mutate(project.name);
  };

  return (
    <Link
      className="block h-full w-full"
      href={`/projects/${encodeURIComponent(project.name)}`}
    >
      <motion.div
        className={`relative flex min-h-[160px] w-full cursor-pointer flex-col rounded-lg border bg-background-secondary p-4 text-left shadow-sm ${
          deleteProjectMutation.isPending
            ? "border-theme-red"
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

        <h3 className="mb-2 text-foreground">{project.displayName}</h3>

        {/* Resource count in bottom right */}
        <div className="absolute bottom-4 left-4">
          <span className="text-muted-foreground">
            {resources?.length || 0} resources
          </span>
        </div>

        {/* Compatibility badge at bottom left */}
        {/* <div className="absolute bottom-4 left-4">
          <Badge variant="secondary" className="text-xs">
            {project.metadata.compatibility}
          </Badge>
        </div> */}
      </motion.div>
    </Link>
  );
};

export default ProjectCard;
