"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import ProjectCard from "@/components/project/project-card";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { ProjectObjectSchema } from "@/lib/brain/resources/project/project-schemas/project-object-schema";
import { z } from "zod";
import { motion } from "framer-motion";

interface RecentProjectsProps {
  projects: z.infer<typeof ProjectObjectSchema>[] | undefined;
  isLoading: boolean;
  isError: boolean;
  displayProjects: z.infer<typeof ProjectObjectSchema>[];
}

export default function RecentProjects({
  projects,
  isLoading,
  isError,
  displayProjects,
}: RecentProjectsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.8, // Same delay as suggestions section
        duration: 0.7,
        ease: "easeOut",
      }}
      className="flex-shrink-0"
    >
      <div className="w-full bg-background">
        <div className="max-w-3xl mx-auto py-8">
          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {isLoading && (
              <div className="col-span-full flex h-32 items-center justify-center">
                <Spinner variant="bars" size={24} />
              </div>
            )}

            {isError && (
              <div className="col-span-full flex h-32 items-center justify-center">
                <div className="text-destructive text-sm">
                  Error loading projects
                </div>
              </div>
            )}

            {!isError && !isLoading && displayProjects.length === 0 && (
              <div className="col-span-full flex h-32 items-center justify-center">
                <div className="text-muted-foreground text-sm">
                  No projects yet
                </div>
              </div>
            )}

            {!isError &&
              displayProjects
                .slice(0, 2)
                .map((project) => (
                  <ProjectCard
                    key={project.name}
                    project={project}
                    variant="lite"
                  />
                ))}

            {/* All Projects button in the third slot */}
            {!isError && !isLoading && displayProjects.length > 0 && (
              <Button
                variant="outline"
                className="h-10 flex items-center justify-between px-4"
                asChild
              >
                <Link href="/projects">
                  <span>All Projects</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
