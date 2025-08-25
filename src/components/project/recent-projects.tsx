"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import ProjectCard from "@/components/project/project-card";
import { motion } from "framer-motion";

interface RecentProjectsProps {
  projects: any[] | undefined;
  isLoading: boolean;
  isError: boolean;
  displayProjects: any[];
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
      exit={{ opacity: 0, y: -20 }}
      transition={{
        delay: 0.3,
        duration: 0.8,
        ease: "easeOut",
      }}
      className="w-full bg-background"
    >
      <div className="max-w-3xl mx-auto py-8">
        {/* Projects Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Recent Projects</h2>
          {!isError && projects && (
            <Button variant="ghost" size="sm" asChild>
              <a href="/projects">View All Projects ({projects.length})</a>
            </Button>
          )}
        </div>

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
            displayProjects.map((project: any) => (
              <ProjectCard key={project.name} project={project} />
            ))}
        </div>
      </div>
    </motion.div>
  );
}
