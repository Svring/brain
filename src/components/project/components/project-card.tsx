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
import {
  getCurrentNamespace,
  getDecodedKubeconfig,
} from "@/lib/k8s/k8s-method/k8s-utils";
import { K8sApiContextSchema } from "@/lib/k8s/schemas";

interface ProjectCardProps {
  projectName: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ projectName }) => {
  const { toast } = useToast();

  const deleteProjectMutation = useDeleteProjectMutation();

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

  return (
    <Link
      className="block h-full w-full"
      href={`/project/${encodeURIComponent(projectName)}`}
    >
      <motion.div
        className="relative flex min-h-[160px] w-full cursor-pointer flex-col rounded-lg border bg-background-secondary p-4 text-left shadow-sm"
        transition={{ duration: 0.15, ease: "easeInOut" }}
        whileHover={{ y: -5 }}
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
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                disabled={deleteProjectMutation.isPending}
                onClick={handleDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {deleteProjectMutation.isPending ? "Deleting..." : "Delete"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <h3 className="mb-2 text-foreground">{projectName}</h3>
      </motion.div>
    </Link>
  );
};

export default ProjectCard;
