"use client";

import { MoreHorizontal, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import type React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/general/use-toast";
import { useDeleteProjectMutation } from "@/lib/project/project-method/project-mutation";
import { createK8sContext } from "@/lib/auth/auth-utils";
import { getProjectDisplayNameFromResource } from "@/lib/project/project-method/project-utils";
import { getProjectOptions } from "@/lib/project/project-method/project-query";
import { useQuery } from "@tanstack/react-query";

interface ProjectCardProps {
  projectName: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ projectName }) => {
  const { toast } = useToast();
  const context = createK8sContext();
  const { data: project } = useQuery(getProjectOptions(context, projectName));

  const deleteProjectMutation = useDeleteProjectMutation(context);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    deleteProjectMutation.mutate(
      { projectName },
      {
        onSuccess: (data) => {
          toast({
            title: "Project deleted",
            description: `${projectName} has been deleted successfully.`,
          });
        },
        onError: (error) => {
          toast({
            title: "Delete failed",
            description:
              error.message || "Failed to delete project. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  if (!project) {
    return null;
  }

  const projectDisplayName = getProjectDisplayNameFromResource(project);

  return (
    <Link
      className="block h-full w-full"
      href={`/projects/${encodeURIComponent(projectName)}`}
    >
      <motion.div
        className={`relative flex min-h-[160px] w-full cursor-pointer flex-col rounded-lg border bg-background-secondary p-4 text-left shadow-sm ${
          deleteProjectMutation.isPending
            ? "border-theme-red"
            : "hover:border-amber-50"
        }`}
        transition={{ duration: 0.15, ease: "easeInOut" }}
      >
        {/* Triple dot menu */}
        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="h-8 w-8 p-0 hover:bg-muted"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                size="sm"
                variant="ghost"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="rounded-lg " align="start">
              <DropdownMenuItem
                className="text-destructive rounded-lg"
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

        <h3 className="mb-2 text-foreground">{projectDisplayName}</h3>
      </motion.div>
    </Link>
  );
};

export default ProjectCard;
