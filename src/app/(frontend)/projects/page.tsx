"use client";

import { useEffect } from "react";
import ProjectCard from "@/components/project/project-card";
import SearchBar from "@/components/ui/search-bar";
import useProjectSearch from "@/hooks/brain/use-projects-search";
import { useProjectActions } from "@/contexts/project/project-context";
import { Spinner } from "@/components/ui/spinner";
import EmptyState from "@/components/project/empty-state";
import { ProjectObjectSchema } from "@/lib/brain/resources/project/project-schemas/project-object-schema";
import { z } from "zod";

export default function Page() {
  const { setAllProjects } = useProjectActions();

  const { setSearchTerm, filteredProjects, projects, isLoading, isError } =
    useProjectSearch();

  // Update the global project context with all projects when they're loaded
  useEffect(() => {
    if (!isLoading && !isError && projects) {
      setAllProjects(projects);
    }
  }, [projects]);

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
          {/* Search bar and plus button in the same row */}
          <div className="flex items-center gap-3">
            <SearchBar
              onSearchChange={setSearchTerm}
              placeholder="Search projects..."
            />
            {/* <Button variant="ghost" onClick={openDialog}>
              <Plus />
            </Button> */}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-4xl">
        <div className="grid grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full flex h-32 items-center justify-center">
              <Spinner variant="bars" size={24} />
            </div>
          ) : isError ? (
            <div className="col-span-full flex h-32 items-center justify-center">
              <div className="text-destructive">Error loading projects</div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="col-span-full">
              <EmptyState />
            </div>
          ) : (
            filteredProjects.map((project: z.infer<typeof ProjectObjectSchema>) => (
              <ProjectCard key={project.name} project={project} />
            ))
          )}
        </div>
      </div>

      {/* <ProjectProposalDemo /> */}
      {/* <CreateProjectDialog /> */}
    </div>
  );
}
