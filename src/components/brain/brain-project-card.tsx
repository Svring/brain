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
import { BrainProjectObjectSchema } from "@/lib/brain/brain-schemas/brain-project-object-schema";
import { z } from "zod";

interface BrainProjectCardProps {
  project: z.infer<typeof BrainProjectObjectSchema>;
}

const BrainProjectCard: React.FC<BrainProjectCardProps> = ({ project }) => {
  const { toast } = useToast();
  const context = createK8sContext();

  const deleteProjectMutation = useDeleteProjectMutation(context);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    deleteProjectMutation.mutate(
      { projectName: project.name },
      {
        onSuccess: (data) => {
          toast({
            title: "Project deleted",
            description: `${project.name} has been deleted successfully.`,
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
      href={`/projects/${encodeURIComponent(project.name)}`}
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

        <h3 className="mb-2 text-foreground">{project.displayName}</h3>
      </motion.div>
    </Link>
  );
};

export default BrainProjectCard;
