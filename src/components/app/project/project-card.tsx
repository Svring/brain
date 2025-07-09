"use client";

import { motion } from "motion/react";
import { MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
import type React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useDeleteProjectResourcesMutation } from "@/lib/app/project/project-mutation";
import { getCurrentNamespace, getDecodedKubeconfig } from "@/lib/k8s/k8s-utils";
import { K8sApiContextSchema } from "@/lib/k8s/schemas";

interface ProjectCardProps {
  projectName: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ projectName }) => {
  const { toast } = useToast();

  // Create K8s API context
  const context = K8sApiContextSchema.parse({
    namespace: getCurrentNamespace(),
    kubeconfig: getDecodedKubeconfig(),
  });

  const deleteProjectMutation = useDeleteProjectResourcesMutation(context);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    deleteProjectMutation.mutate(
      { projectName },
      {
        onSuccess: (data) => {
          toast({
            title: "Project deleted",
            description: `${projectName} has been deleted successfully. ${data.totalDeleted} resources were removed.`,
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
        className="relative flex min-h-[160px] w-full cursor-pointer flex-col rounded-lg border bg-background p-4 text-left shadow-sm"
        transition={{ duration: 0.15, ease: "easeInOut" }}
        whileHover={{ y: -5 }}
      >
        {/* Triple dot menu */}
        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-muted"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
                disabled={deleteProjectMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
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
