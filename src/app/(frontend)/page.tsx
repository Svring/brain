"use client";

import { Plus } from "lucide-react";
import CreateProject from "@/components/app/project/create-project";
import { ProjectCard } from "@/components/app/project/project-card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useProjects } from "@/hooks/app/project/use-projects";

export default function Page() {
  const {
    data: projects,
    isLoading: projectsLoading,
    isError: projectsError,
  } = useProjects();

  return (
    <div className="flex min-h-screen w-full flex-col items-center p-8">
      {/* Header */}
      <div className="mb-8 flex w-4xl">
        <div className="flex w-full items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <h1 className="rounded-md px-3 py-1 font-semibold text-lg">
              Projects
            </h1>
          </div>
          <Dialog>
            <DialogTrigger>
              <Button variant="ghost">
                <Plus size={8} />
              </Button>
            </DialogTrigger>
            <DialogContent className="h-[90vh] max-h-none w-[90vw] max-w-none">
              <CreateProject />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Content */}
      <div className="w-4xl">
        <div className="grid grid-cols-3 gap-6">
          {projectsLoading && (
            <div className="col-span-full flex h-32 items-center justify-center">
              <div className="text-muted-foreground">Loading projects...</div>
            </div>
          )}

          {projectsError && (
            <div className="col-span-full flex h-32 items-center justify-center">
              <div className="text-destructive">Error loading projects</div>
            </div>
          )}

          {projects &&
          !projectsLoading &&
          !projectsError &&
          projects.items.length === 0 ? (
            <div className="col-span-full flex h-32 items-center justify-center">
              <div className="text-muted-foreground">No projects found</div>
            </div>
          ) : (
            projects?.items.map((project) => (
              <ProjectCard
                key={project.metadata.name}
                projectName={project.metadata.name}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
